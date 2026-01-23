import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createFilePath } from "./generate-file-path";
import { v4 as uuidv4 } from "uuid";

export async function saveBufferFile(
  buffer: Buffer,
  userId: string,
  relationIds: Record<string, string>,
  fileType: string,
  mediaType: string = "profileMedias" // yeni parametre
): Promise<string> {
  const imageId = uuidv4();
  const uploadPath = createFilePath(userId, relationIds, mediaType);
  const uploadDir = path.join(process.cwd(), "public", uploadPath);

  await mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, `${imageId}.${fileType}`);
  await writeFile(filePath, buffer);

  return `${uploadPath}/${imageId}.${fileType}`;
}
