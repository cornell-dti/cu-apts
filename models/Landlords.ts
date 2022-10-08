import { model, Schema } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { ILandlordDocument } from '../types/landlordtypes';

const landlordSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    avgRating: {
      // 'google'
      type: Number,
    },
    profilePhoto: {
      type: String,
    },
    photos: {
      type: [String],
    },
    reviews: {
      type: [String],
    },
    properties: {
      type: [String],
    },
    address: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

landlordSchema.plugin(autopopulate);

export default model<IUserDocument>('User', landlordSchema);
