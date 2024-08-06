import { Schema, SchemaTypes, model } from 'mongoose';

const MusicPermissionSchema = new Schema(
  {
    roleName: {
      type: SchemaTypes.String,
      required: true
    },
    roleId: {
      type: SchemaTypes.String,
      required: true
    }
  },
  { versionKey: false }
);

export const MusicPermission = model('MusicPermission', MusicPermissionSchema);
