const prisma = require("../config/prisma");

async function updateProfile(userId, bio, avatar) {
    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            bio,
            ...(avatar && {
                avatar,
            }),
        },
    });
}

module.exports = {
    updateProfile,
};