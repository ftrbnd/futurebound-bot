import { Schema, SchemaTypes, model } from 'mongoose';

const DailyHeardleCheckSchema = new Schema(
  {
    prevDay: {
      type: SchemaTypes.Number,
      required: true
    },
    prevSong: {
      type: SchemaTypes.String,
      required: true
    },
    nextDay: {
      type: SchemaTypes.Number,
      required: false
    },
    nextSong: {
      type: SchemaTypes.String,
      required: false
    }
  },
  { versionKey: false }
);

export const DailyHeardleCheck = model('DailyHeardleCheck', DailyHeardleCheckSchema);
