import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvaluationDocument extends Document {
  teamId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  juryId: mongoose.Types.ObjectId;
  innovation: number;
  technicalExcellence: number;
  presentation: number;
  feasibility: number;
  impact: number;
  totalScore: number;
  remarks?: string;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EvaluationSchema = new Schema<IEvaluationDocument>(
  {
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true, unique: true },
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    juryId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    innovation: { type: Number, required: true, min: 0, max: 20 },
    technicalExcellence: { type: Number, required: true, min: 0, max: 20 },
    presentation: { type: Number, required: true, min: 0, max: 20 },
    feasibility: { type: Number, required: true, min: 0, max: 20 },
    impact: { type: Number, required: true, min: 0, max: 20 },
    totalScore: { type: Number, required: true, min: 0, max: 100 },
    remarks: { type: String, default: "" },
    isLocked: { type: Boolean, default: true },
  },
  { timestamps: true }
);

EvaluationSchema.index({ roomId: 1 });
EvaluationSchema.index({ totalScore: -1 });

const Evaluation: Model<IEvaluationDocument> =
  mongoose.models.Evaluation ||
  mongoose.model<IEvaluationDocument>("Evaluation", EvaluationSchema);

export default Evaluation;
