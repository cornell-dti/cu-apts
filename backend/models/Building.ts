import { model, Schema } from 'mongoose';
// import { IEventDocument } from '../types/event.type';
// import User from './User';
// import Tag from './Tag';
// import Org from './Org';

// const eventSchema = new Schema(
//   {
//     userId: {
//       type: String,
//     },
//     orgId: {
//       type: String,
//       required: true,
//     },
//     title: {
//       type: String,
//       required: true,
//     },
//     location: {
//       type: String,
//       required: true,
//     },
//     tagId: {
//       // tag may not exist for scraped events
//       type: String,
//     },
//     dates: {
//       type: [
//         {
//           date: {
//             type: Date,
//             required: true,
//           },
//           startTime: {
//             type: String,
//             required: true,
//             minlength: 4,
//             maxlength: 4,
//           },
//           endTime: {
//             type: String,
//             required: true,
//             minlength: 4,
//             maxlength: 4,
//           },
//         },
//       ],
//       required: true,
//     },
//     details: {
//       type: String,
//       default: '',
//     },
//     imgs: {
//       type: [String],
//       default: [],
//     },
//     views: {
//       type: Number,
//       default: 0,
//     },
//     likedUserIds: {
//       type: [String],
//       default: [],
//     },
//     provider: {
//       type: String,
//     },
//     providerId: {
//       type: String,
//     },
//     providerUrl: {
//       type: String,
//     },
//     providerData: {
//       type: Schema.Types.Mixed,
//     },
//     /* ticketing */
//     isTicketed: {
//       type: Boolean,
//       default: false,
//     },
//     totalTicketCount: {
//       type: Number,
//     },
//     price: {
//       type: Number,
//     },
//     isEarlyPrice: {
//       type: Boolean,
//       default: false,
//     },
//     earlyPrice: {
//       type: Number,
//     },
//     earlyDeadline: {
//       type: Date,
//     },
//     venmoId: {
//       type: String,
//     },
//     checkInInstructions: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//     toObject: { virtuals: true },
//     toJSON: { virtuals: true },
//   }
// );

// eventSchema.virtual('likedUsers', {
//   ref: User,
//   localField: 'likedUserIds',
//   foreignField: '_id',
//   justOne: false,
//   autopopulate: true,
// });

// eventSchema.virtual('tag', {
//   ref: Tag,
//   localField: 'tagId',
//   foreignField: '_id',
//   justOne: true,
//   autopopulate: true,
// });

// eventSchema.virtual('org', {
//   ref: Org,
//   localField: 'orgId',
//   foreignField: '_id',
//   justOne: true,
//   autopopulate: true,
// });

// eventSchema.virtual('user', {
//   ref: User,
//   localField: 'userId',
//   foreignField: '_id',
//   justOne: true,
//   autopopulate: true,
// });

// eventSchema.plugin(require('mongoose-autopopulate'));

// export default model<IEventDocument>('Event', eventSchema);
