import { Storage } from "@google-cloud/storage";
import path from "path";

const storage = new Storage({
  keyFilename: path.join(process.cwd(), "gcp-key.json"),
  projectId: "YOUR_PROJECT_ID",
});

const bucketName = "my-app-uploads";
const bucket = storage.bucket(bucketName);

export { bucket };
