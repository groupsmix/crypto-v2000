import { type ExchangeDetail } from "@/lib/data/exchanges";
import { redis } from "@/lib/redis";

export type VsVerdict = {
  summary: string;
  overallWinner: string;
  forBeginners: { winner: string; reason: string };
  forAdvanced: { winner: string; reason: string };
  forFees: { winner: string; reason: string };
  forPrivacy: { winner: string; reason: string };
  forCoinVariety: { winner: string; reason: string };
  forUx: { winner: string; reason: string };
  faqs: { question: string; answer: string }[];
  generatedAt: string;
};

const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours
const CACHE_PREFIX = "vs-verdict:";

function getCacheKey(a: string, b: string): string {
  return CACHE_PREFIX + [a, b].sort().join("|");
}

/**
 * Generate a deterministic verdict comparing two exchanges.
 * Uses Redis-backed cache that persists across Cloudflare Workers isolates.
 *
 * In production, this would call an AI API (e.g. Anthropic Claude).
 * For now, it generates structured verdicts from exchange data.
 */
export async function generateVsVerdict(
  exchangeA: ExchangeDetail,
  exchangeB: ExchangeDetail
): Promise<VsVerdict> {
  const cacheKey = getCacheKey(exchangeA.slug, exchangeB.slug);

  try {
    const cached = await redis.get<VsVerdict>(cacheKey);
    if (cached) {
      return cached;
    }
  } catch {
    // Redis unavailable — proceed without cache
  }

  const verdict = buildVerdict(exchangeA, exchangeB);

  try {
    await redis.set(cacheKey, verdict, { ex: CACHE_TTL_SECONDS });
  } catch {
    // Redis unavailable — verdict still returned, just not cached
  }

  return verdict;
}

function buildVerdict(a: ExchangeDetail, b: ExchangeDetail): VsVerdict {
  const now = new Date().toISOString();

  // Determine fee winner
  const aSpotFee = a.fees ? (a.fees.spotMakerFee + a.fees.spotTakerFee) / 2 : Infinity;
  const bSpotFee = b.fees ? (b.fees.spotMakerFee + b.fees.spotTakerFee) / 2 : Infinity;
  const feeWinner = aSpotFee <= bSpotFee ? a : b;
  const feeLoser = feeWinner === a ? b : a;

  // Determine coin variety winner
  const coinWinner = a.supportedCoinsCount >= b.supportedCoinsCount ? a : b;
  const coinLoser = coinWinner === a ? b : a;

  // Determine beginner-friendliness (higher score + simpler = better for beginners)
  const aBeginnerScore = a.score + (a.futuresAvailable ? 0 : 0.5);
  const bBeginnerScore = b.score + (b.futuresAvailable ? 0 : 0.5);
  const beginnerWinner = aBeginnerScore >= bBeginnerScore ? a : b;
  const beginnerLoser = beginnerWinner === a ? b : a;

  // Determine advanced trader winner (futures + coins + lower fees)
  const aAdvancedScore =
    (a.futuresAvailable ? 2 : 0) +
    (a.supportedCoinsCount > 300 ? 1 : 0) +
    (aSpotFee < 0.2 ? 1 : 0);
  const bAdvancedScore =
    (b.futuresAvailable ? 2 : 0) +
    (b.supportedCoinsCount > 300 ? 1 : 0) +
    (bSpotFee < 0.2 ? 1 : 0);
  const advancedWinner = aAdvancedScore >= bAdvancedScore ? a : b;
  const advancedLoser = advancedWinner === a ? b : a;

  // UX winner (higher score generally = better UX)
  const uxWinner = a.score >= b.score ? a : b;
  const uxLoser = uxWinner === a ? b : a;

  // Privacy winner (no KYC wins)
  const privacyWinner =
    a.kycRequired === b.kycRequired
      ? null
      : a.kycRequired
        ? b
        : a;
  const privacyLoser = privacyWinner === a ? b : privacyWinner === b ? a : null;

  // Build fee description
  const feeWinnerFeeStr = feeWinner.fees
    ? `${feeWinner.fees.spotMakerFee}%/${feeWinner.fees.spotTakerFee}%`
    : "competitive";
  const feeLoserFeeStr = feeLoser.fees
    ? `${feeLoser.fees.spotMakerFee}%/${feeLoser.fees.spotTakerFee}%`
    : "higher";

  // Overall winner by score
  const overallWinner = a.score >= b.score ? a : b;
  const overallLoser = overallWinner === a ? b : a;

  const summary = `In the ${a.name} vs ${b.name} comparison, ${overallWinner.name} takes a slight edge with an overall score of ${overallWinner.score.toFixed(1)}/10 compared to ${overallLoser.name}'s ${overallLoser.score.toFixed(1)}/10. However, the best choice depends on your trading needs. ${feeWinner.name} offers lower trading fees (${feeWinnerFeeStr} spot maker/taker), while ${coinWinner.name} supports more cryptocurrencies (${coinWinner.supportedCoinsCount}+ coins). ${a.futuresAvailable && b.futuresAvailable ? "Both exchanges support futures trading." : a.futuresAvailable ? `${a.name} offers futures trading, while ${b.name} focuses on spot trading.` : b.futuresAvailable ? `${b.name} offers futures trading, while ${a.name} focuses on spot trading.` : "Neither exchange currently offers futures trading."}`;

  // Build FAQ entries
  const faqs = [
    {
      question: `Which is better, ${a.name} or ${b.name}?`,
      answer: summary,
    },
    {
      question: `Which has lower fees, ${a.name} or ${b.name}?`,
      answer: `${feeWinner.name} wins on fees with spot rates of ${feeWinnerFeeStr} (maker/taker) compared to ${feeLoser.name}'s ${feeLoserFeeStr}.`,
    },
    {
      question: `Which is better for beginners, ${a.name} or ${b.name}?`,
      answer: `${beginnerWinner.name} is better suited for beginners with a score of ${beginnerWinner.score.toFixed(1)}/10 and a ${beginnerWinner.futuresAvailable ? "comprehensive" : "streamlined"} trading interface.`,
    },
    {
      question: `Does ${a.name} or ${b.name} support more cryptocurrencies?`,
      answer: `${coinWinner.name} supports ${coinWinner.supportedCoinsCount}+ cryptocurrencies compared to ${coinLoser.name}'s ${coinLoser.supportedCoinsCount}+.`,
    },
    {
      question: `Does ${a.name} or ${b.name} offer futures trading?`,
      answer: a.futuresAvailable && b.futuresAvailable
        ? `Both ${a.name} and ${b.name} offer futures trading.`
        : a.futuresAvailable
          ? `${a.name} offers futures trading, while ${b.name} does not.`
          : b.futuresAvailable
            ? `${b.name} offers futures trading, while ${a.name} does not.`
            : `Neither ${a.name} nor ${b.name} currently offers futures trading.`,
    },
    ...(privacyWinner
      ? [
          {
            question: `Which exchange has less KYC requirements, ${a.name} or ${b.name}?`,
            answer: `${privacyWinner.name} does not require KYC for basic features, making it the better choice for users who value privacy. ${privacyLoser?.name ?? "The other exchange"} requires KYC verification.`,
          },
        ]
      : []),
  ];

  return {
    summary,
    overallWinner: overallWinner.name,
    forBeginners: {
      winner: beginnerWinner.name,
      reason: `${beginnerWinner.name} is better suited for beginners with a score of ${beginnerWinner.score.toFixed(1)}/10 and a ${beginnerWinner.futuresAvailable ? "comprehensive" : "streamlined"} trading interface. ${beginnerLoser.name} (${beginnerLoser.score.toFixed(1)}/10) is also a solid choice but may have a steeper learning curve${beginnerLoser.supportedCoinsCount > 300 ? " due to its extensive feature set" : ""}.`,
    },
    forAdvanced: {
      winner: advancedWinner.name,
      reason: `${advancedWinner.name} caters to advanced traders with ${advancedWinner.futuresAvailable ? "futures trading support, " : ""}${advancedWinner.supportedCoinsCount}+ supported coins${advancedWinner.fees ? `, and competitive fees at ${advancedWinner.fees.spotMakerFee}% maker` : ""}. ${advancedLoser.name} is suitable but ${!advancedLoser.futuresAvailable ? "lacks futures trading" : "has fewer advanced features"}.`,
    },
    forFees: {
      winner: feeWinner.name,
      reason: `${feeWinner.name} wins on fees with spot rates of ${feeWinnerFeeStr} (maker/taker) compared to ${feeLoser.name}'s ${feeLoserFeeStr}. ${feeWinner.fees?.withdrawalFee != null ? `Withdrawal fees are ${feeWinner.fees.withdrawalFee > 0 ? `${feeWinner.fees.withdrawalFee} BTC` : "free"}.` : ""}`,
    },
    forPrivacy: privacyWinner
      ? {
          winner: privacyWinner.name,
          reason: `${privacyWinner.name} does not require KYC for basic features, making it the better choice for privacy-focused users. ${privacyLoser?.name ?? "The other exchange"} requires full KYC verification before trading.`,
        }
      : {
          winner: "Tie",
          reason: `Both ${a.name} and ${b.name} ${a.kycRequired ? "require" : "do not require"} KYC verification. Neither has a privacy advantage over the other.`,
        },
    forCoinVariety: {
      winner: coinWinner.name,
      reason: `${coinWinner.name} supports ${coinWinner.supportedCoinsCount}+ cryptocurrencies compared to ${coinLoser.name}'s ${coinLoser.supportedCoinsCount}+. If you're looking for a wide selection of altcoins and trading pairs, ${coinWinner.name} is the clear choice.`,
    },
    forUx: {
      winner: uxWinner.name,
      reason: `${uxWinner.name} scores ${uxWinner.score.toFixed(1)}/10 for overall user experience, offering a polished interface${uxWinner.foundedYear ? ` refined since ${uxWinner.foundedYear}` : ""}. ${uxLoser.name} (${uxLoser.score.toFixed(1)}/10) also provides a good experience but ${uxWinner.score - uxLoser.score > 0.5 ? "trails noticeably" : "is very close"} in our assessment.`,
    },
    faqs,
    generatedAt: now,
  };
}
