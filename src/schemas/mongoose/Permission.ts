import mongoose, { Schema } from "mongoose";

const permissionSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please provide a permission name"],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please provide a description for the permission"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Permission =
  mongoose.models.Permission || mongoose.model("Permission", permissionSchema);

export default Permission;
