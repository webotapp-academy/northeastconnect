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
          fontSize: 22,
          fontWeight: 900,
          background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "8px",
          fontFamily: "sans-serif",
          boxShadow: "inset 0 0 4px rgba(0,0,0,0.2)",
        }}
      >
        N
      </div>
    ),
    {
      ...size,
    }
  );
}
