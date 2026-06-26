import mongoose, { Schema } from "mongoose";

const emailSignatureSchema = new Schema(
  {
    signatureName: {
      type: String,
      required: true,
      trim: true,
    },
    information: {
      name: { type: Boolean, default: false },
      pronouns: { type: Boolean, default: false },
      jobtitle: { type: Boolean, default: false },
      companyname: { type: Boolean, default: false },
      location: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      phoneNumber: { type: Boolean, default: false },
    },
    images: {
      profilepic: { type: Boolean, default: false },
      companylogo: { type: Boolean, default: false },
      qrcode: { type: Boolean, default: false },
      showBanner: { type: Boolean, default: false },
      banner: { type: String, default: "" },
    },
    disclaimer: {
      type: String,
      default: "",
      trim: true,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const EmailSignature =
  mongoose.models.EmailSignature ||
  mongoose.model("EmailSignature", emailSignatureSchema);

export default EmailSignature;
