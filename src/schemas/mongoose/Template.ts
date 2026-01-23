import mongoose, { Schema } from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    templateName: { type: String, required: true },
    cardLayout: {
      type: String,
      enum: ["Left Aligned", "Center Aligned", "Portrait"],
      default: "Left Aligned",
    },

    profilePicture: { type: String },
    coverPhoto: { type: String },
    companyLogo: { type: String },

    company: { type: String },
    location: { type: String },
    bio: { type: String },

    cardTheme: { type: String },
    linkColor: { type: String },
    matchLinkIconsToTheme: { type: Boolean, default: false },

    font: { type: String, default: "Baskerville" },

    links: {
      type: Schema.Types.Mixed,
      default: {},
    },
    leadForm: {
      type: Schema.Types.Mixed,
      default: null,
    },

    connectButtonLabel: { type: String, default: "Connect" },
    formDisclaimer: { type: String },

    allowNonAdminsToUse: { type: Boolean, default: false },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

  },
  {
    timestamps: true,
  }
);

const CardTemplate =
  mongoose.models.Template || mongoose.model("Template", templateSchema);

export default CardTemplate;
