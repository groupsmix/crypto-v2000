import { NextResponse } from "next/server";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin,polkadot&order=market_cap_desc&per_page=8&page=1&sparkline=false";

export const revalidate = 60; // ISR: cache for 60 seconds

export async function GET() {
  try {
    const res = await fetch(COINGECKO_URL, { next: { revalidate: 60 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch prices" },
        { status: 502 }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 502 }
    );
  }
}
