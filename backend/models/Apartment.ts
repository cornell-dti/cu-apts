import { model, Schema } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import { IApartmentDocument } from '../types/apartment.type';

const apartmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    numBaths: {
      type: Number,
    },
    landlordId: {
      type: String,
    },
    numBeds: {
      type: Number,
    },
    photos: {
      type: [String],
    },
    area: {
      type: String,
    },
  },
  { timestamps: true }
);

apartmentSchema.plugin(autopopulate);

export default model<IApartmentDocument>('buildingsCollection', apartmentSchema);
