const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRepo = require("../repositories/user.repository");
const cloudinary = require("../config/cloudinary");
const authRepo = require("../repositories/auth.repository");
const urlUtils = require("../utilities/urlUtilities");


async function signup(data) {
    const existingEmail = await userRepo.findByEmail(data.email);

    if (existingEmail) {
        throw new Error("Email already exists");
    }

    const existingUsername = await userRepo.findByUsername(data.username);

    if (existingUsername) {
        throw new Error("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await userRepo.createUser({
        displayName: data.displayName,
        username: data.username,
        email: data.email,
        password: hashedPassword,
        avatar: data.displayName[0],
    });

    return {
        message: "User created successfully",
    };
}

async function login(data) {
    const user = await userRepo.findByEmail(data.email);

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(data.password, user.password);

    if (!validPassword) {
        throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
        {
            id: user.id,
            username: user.username,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );

    const safeUser = {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
    };

    return {
        token,
        user: safeUser,
    };
}

async function updateProfile(userId, bio, file) {
    let avatarUrl;

    /*
    UPLOAD IMAGE
    */
    if (file) {

        const userDetails = await userRepo.findById(userId);
        const publicId = urlUtils.publicIdExtractor(userDetails.avatar); 
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
        }

        const uploadedImage = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: "chat-app",
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                )
                .end(file.buffer);
        });

        avatarUrl = uploadedImage.secure_url;
    }

    return authRepo.updateProfile(userId, bio, avatarUrl);
}

module.exports = {
    signup,
    login,
    updateProfile,
};