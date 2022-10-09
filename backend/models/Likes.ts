import { model, Schema } from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
// import { IBuildingDocument } from '../types/building.type';
type StringSet = Record<string, boolean>;

const likeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  avgRating: {
    type: Number,
  },
  profilePhoto: {},
});

// landlordSchema.plugin(autopopulate);

// export default model<ILandlordDocument>('Landlord', landlordSchema);
