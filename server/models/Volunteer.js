import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    interest: {
      type: String,
      enum: ["Volunteer", "Internship", "Partnership", "Events", "Other"],
      default: "Volunteer",
    },
    message: { type: String, trim: true },
    bloodGroup: { type: String, trim: true },
    emergencyContact: { type: String, trim: true },
    volunteerId: { type: String, unique: true, sparse: true },
    status: { type: String, enum: ["new", "approved", "rejected"], default: "new" },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Volunteer", volunteerSchema);
