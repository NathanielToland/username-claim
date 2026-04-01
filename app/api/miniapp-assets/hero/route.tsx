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
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #f8fbff 0%, #e5edf6 45%, #d9e2ec 100%)",
          padding: "52px 56px",
          color: "#0f172a",
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "#2563eb", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 900 }}>@</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 28, fontWeight: 800 }}>username-claim</span>
              <span style={{ fontSize: 16, color: "#516074", letterSpacing: 2, textTransform: "uppercase" }}>Handle Registry Bureau</span>
            </div>
          </div>
          <div style={{ padding: "10px 18px", borderRadius: 999, background: "rgba(217,247,15,0.38)", color: "#587300", fontSize: 18, fontWeight: 800, textTransform: "uppercase" }}>Available</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#516074", fontWeight: 700 }}>Base Mini App</div>
          <div style={{ fontSize: 94, lineHeight: 0.94, letterSpacing: -6, fontWeight: 900, width: 860 }}>Claim a unique username on Base.</div>
          <div style={{ fontSize: 28, color: "#516074", width: 780 }}>Search the registry, verify availability, and lock one handle to one owner.</div>
        </div>

        <div style={{ display: "flex", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 26px", borderRadius: 22, background: "#2563eb", color: "white", fontSize: 26, fontWeight: 800 }}>Claim Username</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 26px", borderRadius: 22, background: "rgba(15,23,42,0.06)", color: "#0f172a", fontSize: 26, fontWeight: 700 }}>View Registry</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
