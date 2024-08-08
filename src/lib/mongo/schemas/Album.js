import { Schema, SchemaTypes, model } from 'mongoose';

const AlbumSchema = new Schema(
  {
    album: {
      type: SchemaTypes.String,
      required: true
    },
    tracks: {
      type: SchemaTypes.Array,
      required: true
    }
  },
  { versionKey: false }
);

export const Album = model('Album', AlbumSchema);
