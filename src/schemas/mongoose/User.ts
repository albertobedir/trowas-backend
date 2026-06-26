import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
  },
  email_verified: { type: Date, default: null },
  username: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    default: "",
  },
  isVipMember: { type: Boolean, default: false },
  isChangePass: { type: Boolean, default: false },
  accountType: {
    type: String,
    enum: ["individual", "corporate"],
    default: "corporate",
  },
  uniqueUrlName: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    default: "",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password should be at least 6 characters"],
  },
  profileImage: {
    type: String,
    default: "/defaultpp.png",
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  },
  subTeams: [
    {
      type: Schema.Types.ObjectId,
      ref: "SubTeam",
    },
  ],
  roles: {
    teamRole: {
      type: String,
      enum: ["member", "manager", "pending", "owner", "company page"],
      default: null,
    },
    subTeamRole: [
      {
        subTeamId: {
          type: Schema.Types.ObjectId,
          ref: "SubTeam",
        },
        role: {
          type: String,
          enum: ["member", "manager", "pending", "owner"],
          default: null,
        },
      },
    ],
    userRole: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  userCard: [
    {
      cardName: String,
      cardProfileImage: { type: String, default: "/defaultpp.png" },
      cardTeamTemplate: {
        type: Schema.Types.ObjectId,
        ref: "Template",
        default: null,
      },
      cardId: {
        type: Schema.Types.ObjectId,
        ref: "UserCard",
        default: null,
      },
    },
  ],
  templates: [
    {
      type: Schema.Types.ObjectId,
      ref: "Template",
    },
  ],
  permissions: {
    teamPermission: { type: Number, default: null },
    subTeamPermission: { type: String, default: "0" },
    userPermission: [
      {
        type: Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
  },
  emailSignature: {
    type: Schema.Types.ObjectId,
    ref: "EmailSignature",
    default: null,
  },
  notifications: [notificationSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
