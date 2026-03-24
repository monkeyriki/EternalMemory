type CompressionOptions = {
  maxWidth: number;
  maxHeight: number;
  quality: number; // 1-100
  format?: "webp" | "jpeg";
};

type CompressionResult = {
  bytes: Uint8Array;
  contentType: "image/webp" | "image/jpeg";
  extension: "webp" | "jpg";
};

const COMPRESSIBLE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
]);

/** Keep GIF/SVG as-is to avoid breaking animation/vector quality. */
export function isCompressibleRasterContentType(contentType: string): boolean {
  return COMPRESSIBLE_TYPES.has(contentType.toLowerCase());
}

export async function compressImageBuffer(
  input: Buffer,
  options: CompressionOptions
): Promise<CompressionResult> {
  const sharp = (await import("sharp")).default;
  const targetFormat = options.format ?? "webp";

  const pipeline = sharp(input, { failOn: "none" })
    .rotate()
    .resize({
      width: options.maxWidth,
      height: options.maxHeight,
      fit: "inside",
      withoutEnlargement: true
    });

  if (targetFormat === "jpeg") {
    const out = await pipeline
      .jpeg({ quality: options.quality, mozjpeg: true })
      .toBuffer();
    return {
      bytes: new Uint8Array(out),
      contentType: "image/jpeg",
      extension: "jpg"
    };
  }

  const out = await pipeline
    .webp({ quality: options.quality, effort: 4 })
    .toBuffer();
  return {
    bytes: new Uint8Array(out),
    contentType: "image/webp",
    extension: "webp"
  };
}
