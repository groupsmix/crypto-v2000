import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CryptoCompare AI — Compare Crypto Exchanges & Track Prices";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
          <span
            style={{
              fontSize: "36px",
              fontWeight: 700,
              background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            CryptoCompare AI
          </span>
        </div>

        <h1
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#f8fafc",
            textAlign: "center",
            lineHeight: 1.2,
            margin: "0 0 24px 0",
          }}
        >
          Compare Crypto Exchanges
          <br />
          <span style={{ color: "#3b82f6" }}>& Track Prices</span>
        </h1>

        <p
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.5,
          }}
        >
          Side-by-side fee comparisons, live prices, expert reviews, and
          exclusive signup bonuses.
        </p>

        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "48px",
            color: "#64748b",
            fontSize: "18px",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
            Live data
          </span>
          <span>Top exchanges</span>
          <span>Free tools</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
