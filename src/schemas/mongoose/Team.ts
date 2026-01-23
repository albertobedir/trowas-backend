import mongoose, { Schema } from "mongoose";

const cardViewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userCardId: {
      type: Schema.Types.ObjectId,
      ref: "UserCard",
      required: true,
    },
    views: { type: Number, default: 0 },
    from: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const cardConnectSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userCardId: {
      type: Schema.Types.ObjectId,
      ref: "UserCard",
      required: true,
    },
    conenct: { type: Number, default: 0 },
    from: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const linkTapSchema = new Schema(
  {
    linkName: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userCardId: {
      type: Schema.Types.ObjectId,
      ref: "UserCard",
      required: true,
    },
    taps: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const teamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pendingUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    subteams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subteam",
      },
    ],
    templates: [
      {
        type: Schema.Types.ObjectId,
        ref: "CardTemplate",
      },
    ],
    teamPerformance: {
      pipelineGenerated: {
        type: Number,
        default: 0,
      },
      leadsCaptured: {
        type: Number,
        default: 0,
      },
      cardViews: [cardViewSchema],
      cardConnects: [cardConnectSchema],
      linkTaps: [linkTapSchema],
    },
    teamSettings: {
      logo: {
        type: String,
        default: "",
      },
      customSubdomain: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
      },
      isRemoveTrowasBranding: {
        type: Boolean,
        default: false,
      },
      isEnforceSSOLogin: {
        type: Boolean,
        default: false,
      },
      isAutoAddEmailDomain: {
        type: Boolean,
        default: false,
      },
      allowedEmailDomain: {
        type: String,
        trim: true,
        lowercase: true,
        default: "",
      },
    },
    leads: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lead",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);
export default Team;
