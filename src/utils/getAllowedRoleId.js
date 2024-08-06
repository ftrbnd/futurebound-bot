import { MusicPermission } from '../lib/mongo/schemas/MusicPermission.js';

export const getAllowedRoleId = async () => {
  const roleData = await MusicPermission.find({});

  if (!roleData) throw new Error('No role data found');

  return roleData[0].roleId;
};
