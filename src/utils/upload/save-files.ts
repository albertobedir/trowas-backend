import { v4 as uuidv4 } from "uuid";
import { createFilePath } from "./generate-file-path";
import { bucket } from "@/lib/gcs";

export async function saveFile(
  file: File,
  userId: string,
  relationIds: Record<string, string>,
  fileType: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const imageId = uuidv4();

  const filePath = `${createFilePath(userId, relationIds)}/${imageId}.${fileType}`;
  const fileUpload = bucket.file(filePath);

  await fileUpload.save(buffer, {
    contentType: file.type,
    resumable: false,
    public: true,
  });

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  return publicUrl;
}
