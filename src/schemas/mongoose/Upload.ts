import { Schema, models, model } from "mongoose";

const UploadSchema = new Schema({
  userId: { type: String, required: true },
  relationIds: {
    type: Map,
    of: String,
    default: {},
  },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true, default: "webp" },
  createdAt: { type: Date, default: Date.now },
});

const Upload = models.Upload || model("Upload", UploadSchema);
export default Upload;
