import { Schema, SchemaTypes, model } from 'mongoose';

const SettingsSchema = new Schema(
  {
    spotifyCronEnabled: {
      type: SchemaTypes.Boolean,
      required: true
    },
    youtubeCronEnabled: {
      type: SchemaTypes.Boolean,
      required: true
    }
  },
  { versionKey: false }
);

export const Settings = model('Settings', SettingsSchema);
