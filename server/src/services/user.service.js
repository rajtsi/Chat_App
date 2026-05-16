const userRepo = require("../repositories/user.repository");

async function getCurrentUser(
    userId
) {

    const user =
        await userRepo.findById(
            userId
        );

    if (!user) {

        throw new Error(
            "User not found"
        );

    }

    return {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio
    };

}


async function searchUsers(query) {

    const users =
        await userRepo.searchUsers(
            query
        );

    return users.map((user) => ({

        id: user.id,

        displayName:
            user.displayName,

        username:
            user.username,

        avatar:
            user.avatar

    }));

}



module.exports = {
    getCurrentUser,
    searchUsers
};