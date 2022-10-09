import { Document } from 'mongoose';

export interface DetailedRating {
  readonly location: number;
  readonly safety: number;
  readonly value: number;
  readonly maintenance: number;
  readonly communication: number;
  readonly conditions: number;
}

export interface IReviewDocument extends Document {
  readonly aptId: string | null;
  readonly likes?: number;
  readonly date: Date;
  readonly detailedRatings: DetailedRating;
  readonly landlordId: string;
  readonly overallRating: number;
  readonly photos: readonly string[];
  readonly reviewText: string;
}
