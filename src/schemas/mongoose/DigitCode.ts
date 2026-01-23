import mongoose, { Schema } from "mongoose";

const digitCodeSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  code_hash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ["password", "email"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const DigitCode =
  mongoose.models.DigitCode || mongoose.model("DigitCode", digitCodeSchema);

export default DigitCode;
