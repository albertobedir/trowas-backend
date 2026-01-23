import path from "path";

export function createFilePath(
  userId: string,
  relationIds: Record<string, string>,
  mediaType: string = "profileMedias"
): string {
  let uploadPath = `/uploads/${userId}`;

  Object.keys(relationIds).forEach((key) => {
    uploadPath = path.posix.join(uploadPath, key, relationIds[key]);
  });

  uploadPath = path.posix.join(uploadPath, mediaType);
  return uploadPath;
}
