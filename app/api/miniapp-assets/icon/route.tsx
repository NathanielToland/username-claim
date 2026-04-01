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
          background: "linear-gradient(180deg, #f8fbff 0%, #d9e2ec 100%)",
          color: "#0f172a",
          fontSize: 250,
          fontWeight: 900,
          letterSpacing: -16,
        }}
      >
        <div
          style={{
            width: 760,
            height: 760,
            borderRadius: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "24px solid rgba(37, 99, 235, 0.18)",
            background: "radial-gradient(circle at top left, rgba(217,247,15,0.35), white 62%)",
            boxShadow: "0 40px 80px rgba(37,99,235,0.22)",
          }}
        >
          @
        </div>
      </div>
    ),
    { width: 1024, height: 1024 },
  );
}
