import { Schema, SchemaTypes, model } from 'mongoose';

const SpotifySchema = new Schema(
  {
    spotifyId: {
      type: SchemaTypes.String,
      required: true
    },
    name: {
      type: SchemaTypes.String,
      required: true
    }
  },
  { versionKey: false }
);

export const Spotify = model('Spotify', SpotifySchema);
