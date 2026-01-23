import mongoose from "mongoose";

const CardTemplateSchema = new mongoose.Schema(
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

    colorTheme: { type: String },
    linkColor: { type: String },
    matchLinkIconsToTheme: { type: Boolean, default: false },

    font: { type: String, default: "Baskerville" },

    links: [
      {
        type: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],

    connectButtonLabel: { type: String, default: "Connect" },
    formDisclaimer: { type: String },

    allowNonAdminsToUse: { type: Boolean, default: false },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    qrCodeUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
