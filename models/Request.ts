import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRequestDocument extends Document {
  roomId: mongoose.Types.ObjectId;
  juryId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequestDocument>(
  {
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    juryId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

RequestSchema.index({ roomId: 1, status: 1 });

const RequestModel: Model<IRequestDocument> =
  mongoose.models.Request ||
  mongoose.model<IRequestDocument>("Request", RequestSchema);

export default RequestModel;
