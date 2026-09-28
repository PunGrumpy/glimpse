import { logoSvg } from "@/lib/brand";

const PNG_SIZE = 1024;

export const copyText = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text);
};

/** Rasterises the mark at 1024×1024 on a transparent background and downloads it. */
export const downloadLogoPng = async (): Promise<void> => {
  const svgUrl = URL.createObjectURL(
    new Blob([logoSvg()], { type: "image/svg+xml" })
  );
  try {
    const image = new Image(PNG_SIZE, PNG_SIZE);
    image.src = svgUrl;
    await image.decode();
    const canvas = new OffscreenCanvas(PNG_SIZE, PNG_SIZE);
    canvas.getContext("2d")?.drawImage(image, 0, 0, PNG_SIZE, PNG_SIZE);
    const png = await canvas.convertToBlob({ type: "image/png" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(png);
    link.download = "glimpse-logo.png";
    link.click();
    URL.revokeObjectURL(link.href);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
};
