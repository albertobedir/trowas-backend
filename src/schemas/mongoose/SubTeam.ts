import mongoose, { Schema } from "mongoose";

const subTeamSchema = new Schema({
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
  logo: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  parentTeam: {
    type: Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  templates: [
    {
      type: Schema.Types.ObjectId,
      ref: "Template",
    },
  ],
  permissions: {
    type: String,
    default: "0",
  },
  admins: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SubTeam =
  mongoose.models.SubTeam || mongoose.model("SubTeam", subTeamSchema);
export default SubTeam;
