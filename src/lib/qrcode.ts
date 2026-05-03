import QRCode from "qrcode";

export async function generateQRDataURL(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 400,
    margin: 2,
    color: {
      dark: "#1a1a1a",
      light: "#ffffff",
    },
  });
}
