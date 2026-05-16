const prisma = require("../config/prisma");

async function createUser(data) {

    return prisma.user.create({
        data
    });

}

async function findByEmail(email) {

    return prisma.user.findUnique({
        where: {
            email
        }
    });

}

async function findByUsername(username) {

    return prisma.user.findUnique({
        where: {
            username
        }
    });

}

async function findById(id) {

    return prisma.user.findUnique({
        where: {
            id
        }
    });

}

async function searchUsers(query) {

    return prisma.user.findMany({

        where: {

            OR: [

                {
                    username: {
                        contains: query,
                        mode: "insensitive"
                    }
                },

                {
                    displayName: {
                        contains: query,
                        mode: "insensitive"
                    }
                }

            ]

        },

        take: 10

    });

}

module.exports = {
    createUser,
    findByEmail,
    findByUsername,
    findById,
    searchUsers
};