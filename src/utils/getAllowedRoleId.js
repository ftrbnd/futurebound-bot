const MusicPermission = require('../lib/mongo/schemas/MusicPermissionSchema');

const getAllowedRoleId = async () => {
  const roleData = await MusicPermission.find({});

  if (!roleData) throw new Error('No role data found');

  return roleData[0].roleId;
};

module.exports = getAllowedRoleId;
