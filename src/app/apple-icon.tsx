import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#0f172a",
          color: "#ffffff",
          display: "flex",
          fontSize: 64,
          fontWeight: 700,
          height: "100%",
          justifyContent: "center",
          letterSpacing: 1,
          width: "100%",
        }}
      >
        BHQ
      </div>
    ),
    {
      ...size,
    }
  );
}
