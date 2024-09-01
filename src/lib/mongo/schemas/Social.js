import { Schema, SchemaTypes, model } from 'mongoose';

const SocialSchema = new Schema(
  {
    type: {
      type: SchemaTypes.String,
      required: true,
      enum: ['spotify', 'youtube']
    },
    socialId: {
      type: SchemaTypes.String,
      required: true
    },
    title: {
      type: SchemaTypes.String,
      required: true
    }
  },
  { versionKey: false }
);

export const Social = model('Social', SocialSchema);
