import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotificationDocument extends Document {
  title: string;
  message: string;
  type: string;
  targetRole?: string;
  targetRoomId?: mongoose.Types.ObjectId;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    targetRole: { type: String, default: "ALL" },
    targetRoomId: { type: Schema.Types.ObjectId, ref: "Room", default: null },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Notification: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>("Notification", NotificationSchema);

export default Notification;
