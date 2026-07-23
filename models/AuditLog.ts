import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLogDocument extends Document {
  userId?: mongoose.Types.ObjectId;
  userName?: string;
  action: string;
  details: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  userName: { type: String, default: "System" },
  action: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const AuditLog: Model<IAuditLogDocument> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLogDocument>("AuditLog", AuditLogSchema);

export default AuditLog;
