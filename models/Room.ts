import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoomDocument extends Document {
  name: string;
  roomNumber: string;
  description?: string;
  capacity: number;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoomDocument>(
  {
    name: { type: String, required: true, trim: true },
    roomNumber: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    capacity: { type: Number, default: 20 },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Room: Model<IRoomDocument> =
  mongoose.models.Room || mongoose.model<IRoomDocument>("Room", RoomSchema);

export default Room;
