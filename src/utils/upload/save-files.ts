import { v4 as uuidv4 } from "uuid";
import { createFilePath } from "./generate-file-path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const S3_REGION = process.env.AWS_S3_REGION;
const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME;
const S3_ACCESS_KEY = process.env.AWS_S3_ACCESS_KEY;
const S3_SECRET_KEY = process.env.AWS_S3_SECRET_KEY;

const s3Client = new S3Client({
  region: S3_REGION,
  credentials:
    S3_ACCESS_KEY && S3_SECRET_KEY
      ? {
          accessKeyId: S3_ACCESS_KEY,
          secretAccessKey: S3_SECRET_KEY,
        }
      : undefined,
});

export async function saveFile(
  file: File,
  userId: string,
  relationIds: Record<string, string>,
  fileType: string,
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const imageId = uuidv4();

  const filePath = `${createFilePath(userId, relationIds)}/${imageId}.${fileType}`;
  if (!S3_BUCKET || !S3_REGION) {
    throw new Error(
      "S3 bucket or region not configured in environment variables",
    );
  }

  const putParams = {
    Bucket: S3_BUCKET,
    Key: filePath,
    Body: buffer,
    ContentType: file.type,
  } as const;

  await s3Client.send(new PutObjectCommand(putParams));

  const publicUrl =
    S3_REGION === "us-east-1"
      ? `https://${S3_BUCKET}.s3.amazonaws.com/${filePath}`
      : `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${filePath}`;

  return publicUrl;
}
