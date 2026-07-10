import mongoose, { Schema, Document } from 'mongoose';

export interface ISurveyResponse extends Document {
  visitSatisfaction: 'buena' | 'regular' | 'mala';
  clarityOfService: 'muy_claros' | 'regular' | 'nada_claros';
  joinPromotions: 'si' | 'no';
  suggestion: string;
  createdAt: Date;
  branch?: string;
}

const SurveyResponseSchema: Schema = new Schema(
  {
    visitSatisfaction: {
      type: String,
      enum: ['buena', 'regular', 'mala'],
      required: true,
    },
    clarityOfService: {
      type: String,
      enum: ['muy_claros', 'regular', 'nada_claros'],
      required: true,
    },
    joinPromotions: {
      type: String,
      enum: ['si', 'no'],
      required: true,
    },
    suggestion: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    branch: {
      type: String,
      default: 'Principal',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SurveyResponse ||
  mongoose.model<ISurveyResponse>('SurveyResponse', SurveyResponseSchema);
