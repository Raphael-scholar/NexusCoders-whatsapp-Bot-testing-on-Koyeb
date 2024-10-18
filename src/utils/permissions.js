const fs = require('fs-extra');
const path = require('path');

const permissionsPath = path.join(process.cwd(), 'data', 'permissions.json');

const initializePermissions = async () => {
    await fs.ensureFile(permissionsPath);
    const exists = await fs.pathExists(permissionsPath);
    if (!exists || (await fs.readFile(permissionsPath, 'utf8')).trim() === '') {
        await fs.writeJson(permissionsPath, {});
    }
};

const loadPermissions = async () => {
    await initializePermissions();
    return await fs.readJson(permissionsPath);
};

const savePermissions = async (permissions) => {
    await fs.writeJson(permissionsPath, permissions, { spaces: 2 });
};

const checkPermission = async (userId, permission) => {
    const permissions = await loadPermissions();
    if (!permissions[userId]) {
        permissions[userId] = ['USE_COMMANDS'];
        await savePermissions(permissions);
    }
    return permissions[userId].includes(permission);
};

const grantPermission = async (userId, permission) => {
    const permissions = await loadPermissions();
    if (!permissions[userId]) {
        permissions[userId] = [];
    }
    if (!permissions[userId].includes(permission)) {
        permissions[userId].push(permission);
        await savePermissions(permissions);
    }
};

const revokePermission = async (userId, permission) => {
    const permissions = await loadPermissions();
    if (permissions[userId]) {
        permissions[userId] = permissions[userId].filter(p => p !== permission);
        await savePermissions(permissions);
    }
};

module.exports = {
    checkPermission,
    grantPermission,
    revokePermission,
    initializePermissions
};
