import mongoose, { Schema } from "mongoose";
import { send } from "process";

const userCardSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    teamTemplate: {
      templateId: {
        type: Schema.Types.ObjectId,
        ref: "CardTemplate",
      },
      templateName: {
        type: String,
      },
    },
    templates: [
      {
        templateId: {
          type: Schema.Types.ObjectId,
          ref: "CardTemplate",
        },
      },
    ],

    cardName: { type: String, trim: true },

    cardLayout: {
      type: String,
      enum: ["Left Aligned", "Center Aligned", "Portrait"],
      default: "Left Aligned",
    },

    profilePicture: { type: String },

    coverPhoto: { type: String },

    companyLogo: { type: String },

    name: { type: String, trim: true },

    location: { type: String, trim: true },

    jobTitle: { type: String, trim: true },

    call: { type: String, trim: true },
    
    email: { type: String, trim: true },

    company: { type: String, trim: true },

    bio: { type: String, trim: true },

    cardTheme: { type: String },

    linkColor: { type: String },

    matchLinkIconsToTheme: { type: Boolean, default: false },

    font: { type: String, default: "Baskerville" },

    qrCodeUrl: { type: String, default: "" },

    links: {
      type: Schema.Types.Mixed,
      default: {},
    },
    emailData: {
      to: {
        type: [String],
        required: false,
        default: [],
      },
      subject: {
        type: String,
        required: false,
        default: "",
      },
      message: {
        type: String,
        required: false,
        default: "",
      },
      sendAfterHour: {
        type: String,
        required: false,
        default: "",
      },
      sendAfterMinute: {
        type: String,
        required: false,
        default: "",
      },
      isActive: {
        type: Boolean,
        required: false,
        default: false,
      },   
    },
    leadForm: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

const UserCard =
  mongoose.models.UserCard || mongoose.model("UserCard", userCardSchema);
export default UserCard;
