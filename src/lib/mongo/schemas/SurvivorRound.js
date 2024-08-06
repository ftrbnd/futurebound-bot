import { Schema, SchemaTypes, model } from 'mongoose';

const SurvivorRoundSchema = new Schema(
  {
    album: {
      type: SchemaTypes.String,
      required: true
    },
    tracks: {
      type: SchemaTypes.Array,
      required: true
    },
    votes: {
      type: SchemaTypes.Map, // song: userId
      of: SchemaTypes.Array,
      required: true
    },
    standings: {
      type: SchemaTypes.Array,
      required: false
    },
    lastMessageId: {
      type: SchemaTypes.String,
      required: false
    },
    roundNumber: {
      type: SchemaTypes.Number,
      required: false
    }
  },
  { versionKey: false }
);

export const SurvivorRound = model('SurvivorRound', SurvivorRoundSchema);
