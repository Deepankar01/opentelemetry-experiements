import mongoose, { Document, Schema } from 'mongoose';
import { autoIncrement } from 'mongoose-plugin-autoinc-fix';

export enum BOOKSTATUS {
  published = 'published',
  review = 'review',
  printing = 'printing',
  introduced = 'introduced',
}

export interface BookDocument extends Document {
  id: string;
  name: string;
  publisherId: string;
  authorId: string;
  status: BOOKSTATUS;
}

const BookSchema: Schema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    publisherId: { type: String, required: true },
    authorId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(BOOKSTATUS),
      default: 'introduced',
    },
  },
  {
    collection: 'books',
    timestamps: true,
  }
);

BookSchema.plugin(autoIncrement, { model: 'Book', field: 'id', startAt: 1 });

export const BookModel = mongoose.model<BookDocument>('Book', BookSchema);
