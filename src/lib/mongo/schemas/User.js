import { Schema, SchemaTypes, model } from 'mongoose';

const UserSchema = new Schema(
  {
    discordId: {
      type: SchemaTypes.String,
      required: true
    },
    username: {
      type: SchemaTypes.String,
      required: true
    },
    birthday: {
      type: SchemaTypes.Date,
      require: false
    },
    timezone: {
      type: SchemaTypes.String,
      require: false
    },
    warnings: {
      type: SchemaTypes.Number,
      require: false
    },
    muteEnd: {
      type: SchemaTypes.Date,
      require: false
    }
  },
  { versionKey: false }
);

export const User = model('User', UserSchema);
