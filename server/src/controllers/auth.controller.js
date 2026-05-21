const authService = require("../services/auth.service");
const userService = require("../services/user.service");

async function signup(req, res) {
    try {
        const response = await authService.signup(req.body);

        return res.status(201).json({
            success: true,
            data: response,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

async function searchUsers(req, res) {
    try {
        const users = await userService.searchUsers(req.query.query || "");

        return res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

async function login(req, res) {
    try {
        const response = await authService.login(req.body);

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

async function getCurrentUser(req, res) {
    try {
        const user = await userService.getCurrentUser(req.user.id);

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

async function updateProfile(req, res) {
    try {
        const updatedUser = await authService.updateProfile(
            req.user.id,
            req.body.bio,
            req.file
        );

        res.json({
            success: true,
            data: updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports = {
    signup,
    login,
    getCurrentUser,
    updateProfile,
    searchUsers,
};