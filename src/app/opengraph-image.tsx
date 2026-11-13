import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Folio — an academic research workspace for papers, notes, literature reviews, and projects";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F5F3EE",
          color: "#20242B",
          padding: "64px 72px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(to right, rgba(38,62,84,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(38,62,84,0.06) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 5,
              background: "#263E55",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F5F3EE",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            F
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.04em" }}>Folio</span>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#5D6670",
              }}
            >
              Research workspace
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", position: "relative", maxWidth: 860 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#B84A3A",
              fontSize: 12,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            <div style={{ width: 7, height: 7, background: "#B84A3A", display: "flex" }} />
            Academic research workspace
          </div>
          <div
            style={{
              marginTop: 22,
              fontFamily: "Georgia, serif",
              fontSize: 68,
              lineHeight: 1.03,
              letterSpacing: "-0.03em",
              display: "flex",
            }}
          >
            Research deserves a better workspace.
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 22,
              lineHeight: 1.5,
              color: "#5D6670",
              display: "flex",
            }}
          >
            Discover papers, organise your literature, and bring your academic work together.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #D9D8D2",
            paddingTop: 20,
            color: "#5D6670",
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            position: "relative",
          }}
        >
          <span>Discover · Organise · Collaborate · Understand</span>
          <span>Academic research workspace</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
