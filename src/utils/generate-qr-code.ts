import QRCode from "qrcode";

export const generateQRCodeBuffer = async (
  data: string,
  format: "png" | "svg" = "png"
): Promise<Buffer> => {
  try {
    if (format === "svg") {
      const svgString = await QRCode.toString(data, { type: "svg" });
      return Buffer.from(svgString, "utf-8");
    }

    return await QRCode.toBuffer(data);
  } catch (err) {
    throw new Error("QR code generation failed");
  }
};
