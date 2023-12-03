import QRCode from "qrcode";
export async function generateQrCode(data) {
  const qrCode = await QRCode.toDataURL(data);
  return qrCode;
}
