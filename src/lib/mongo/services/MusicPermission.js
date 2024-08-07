import { MusicPermission } from '../schemas/MusicPermission';

// there should only be one instance of this model in the db
export async function getMusicPermission() {
  const permission = await MusicPermission.findOne({});
  return permission;
}

export async function updatePermissionRole(roleName, roleId) {
  const permission = await MusicPermission.findOneAndUpdate({}, { roleName, roleId });

  return permission;
}

export async function createMusicPermission(roleName, roleId) {
  const permission = await MusicPermission.create({
    roleName,
    roleId
  });

  return permission;
}
