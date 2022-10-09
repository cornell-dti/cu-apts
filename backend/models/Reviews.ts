import { model, Schema } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { IReviewDocument } from '../types/review.type';

const reviewSchema = new Schema(
  {
    aptID: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
    },
    date: {
      type: Date,
      required: true,
    },
    detailedRatings: {
      type: {
        location: { type: Number },
        safety: { type: Number },
        value: { type: Number },
        maintenance: { type: Number },
        communication: { type: Number },
        conditions: { type: Number },
      },
      required: true,
    },
    landlordId: {
      type: String,
      required: true,
    },
    overallRating: {
      type: [Number],
    },
    photos: {
      type: [String],
    },
    reviewText: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

reviewSchema.plugin(autopopulate);

export default model<IReviewDocument>('reviewCollections', reviewSchema);
