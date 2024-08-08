import { Schema, SchemaTypes, model } from 'mongoose';

const PlaylistSchema = new Schema(
  {
    name: {
      type: SchemaTypes.String,
      required: true
    },
    link: {
      type: SchemaTypes.String,
      required: true
    }
  },
  { versionKey: false }
);

export const Playlist = model('Playlist', PlaylistSchema);
