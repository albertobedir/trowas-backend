export function validateFile(file: File): boolean {
  return file.type.endsWith("webp");
}
