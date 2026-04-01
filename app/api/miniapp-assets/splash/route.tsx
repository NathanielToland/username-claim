import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #f8fbff 0%, #eef4fb 50%, #d9e2ec 100%)",
          color: "#0f172a",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            width: 760,
            height: 430,
            borderRadius: 56,
            border: "1px solid rgba(15,23,42,0.12)",
            background: "rgba(255,255,255,0.8)",
            boxShadow: "0 30px 60px rgba(37,99,235,0.12)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "42px 48px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 24, color: "#516074", textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}>Loading registry</div>
            <div style={{ padding: "10px 16px", borderRadius: 999, background: "rgba(37,99,235,0.1)", color: "#2563eb", fontSize: 16, fontWeight: 800 }}>Base</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 72, lineHeight: 0.94, letterSpacing: -4, fontWeight: 900 }}>username-claim</div>
            <div style={{ fontSize: 28, color: "#516074" }}>Digital identity bureau for unique handles</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 16, height: 16, borderRadius: 999, background: "#d9f70f" }} />
            <div style={{ fontSize: 22, fontWeight: 700 }}>Preparing availability console</div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 800 },
  );
}
