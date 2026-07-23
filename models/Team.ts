import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeamDocument extends Document {
  name: string;
  college: string;
  leaderName: string;
  members: string[];
  problemStatement: string;
  phone: string;
  email: string;
  submissionLink?: string;
  roomId: mongoose.Types.ObjectId;
  isPresent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeamDocument>(
  {
    name: { type: String, required: true, trim: true },
    college: { type: String, required: true, trim: true },
    leaderName: { type: String, required: true, trim: true },
    members: [{ type: String, trim: true }],
    problemStatement: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    submissionLink: { type: String, default: "" },
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    isPresent: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TeamSchema.index({ roomId: 1 });
TeamSchema.index({ name: 1, college: 1 });

const Team: Model<ITeamDocument> =
  mongoose.models.Team || mongoose.model<ITeamDocument>("Team", TeamSchema);

export default Team;
