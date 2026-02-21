import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#0f172a",
          color: "#ffffff",
          display: "flex",
          fontSize: 14,
          fontWeight: 700,
          height: "100%",
          justifyContent: "center",
          letterSpacing: 0.4,
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
