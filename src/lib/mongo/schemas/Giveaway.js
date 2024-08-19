import { Schema, SchemaTypes, model } from 'mongoose';

const GiveawaySchema = new Schema(
  {
    prize: {
      type: SchemaTypes.String,
      required: true
    },
    description: {
      type: SchemaTypes.String,
      required: true
    },
    endDate: {
      type: SchemaTypes.Date,
      required: true
    },
    entries: {
      type: SchemaTypes.Array,
      required: false
    },
    imageURL: {
      type: SchemaTypes.String,
      required: false
    },
    channelId: {
      type: SchemaTypes.String,
      required: true
    }
  },
  { versionKey: false }
);

export const Giveaway = model('Giveaway', GiveawaySchema);
