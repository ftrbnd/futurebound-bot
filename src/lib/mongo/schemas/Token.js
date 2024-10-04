import { Schema, SchemaTypes, model } from 'mongoose';

const TokenSchema = new Schema(
  {
    service: {
      type: SchemaTypes.String,
      required: true,
      enum: ['spotify']
    },
    access_token: {
      type: SchemaTypes.String,
      required: false
    },
    token_type: {
      type: SchemaTypes.String,
      required: false
    },
    expires_at: {
      type: SchemaTypes.Date,
      required: false
    }
  },
  { versionKey: false, timestamps: true }
);

export const Token = model('Token', TokenSchema);
