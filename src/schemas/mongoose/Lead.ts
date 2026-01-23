import mongoose, { Schema, Document } from "mongoose";

interface Lead extends Document {
  teamId: Schema.Types.ObjectId;
  user: { id: Schema.Types.ObjectId; name: string; profileImage?: string };
  leadData: Record<string, any>;
  sendAfter?: Date; // 🆕 Zamanlı e-posta için tarih
}

const leadSchema = new Schema<Lead>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    user: {
      id: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      profileImage: { type: String, required: false },
    },
    leadData: { type: Map, of: Schema.Types.Mixed, required: true },
    sendAfter: { type: Date, required: false }, // 🆕
  },
  { timestamps: true }
);

const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);
export default Lead;
