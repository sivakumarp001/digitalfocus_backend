const User = require('../models/User');
const { generateToken, updateStreak } = require('../utils/helpers');

// @desc Register user
// @route POST /api/auth/register
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }
        const user = await User.create({ name, email, password, role: role || 'student' });
        if (user) {
            res.status(201).json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                streak: user.streak,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc Login user
// @route POST /api/auth/login
const loginUser = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email });
        
        // Validate user exists and password matches
        if (!user || !(await user.matchPassword(password))) {
            res.status(401);
            throw new Error('Invalid email or password');
        }

        // Validate role matches (if role is provided)
        if (role && user.role !== role) {
            res.status(403);
            throw new Error(`This account is not registered as ${role}. Please login as ${user.role}.`);
        }

        await updateStreak(user);
        res.json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            streak: user.streak,
            totalFocusMinutes: user.totalFocusMinutes,
            productivityScore: user.productivityScore,
            preferences: user.preferences,
            token: generateToken(user._id),
        });
    } catch (error) {
        next(error);
    }
};

// @desc Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// @desc Update profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.preferences) {
                user.preferences = { ...user.preferences.toObject(), ...req.body.preferences };
            }
            if (req.body.password) {
                user.password = req.body.password;
            }
            const updatedUser = await user.save();
            res.json({
                success: true,
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                preferences: updatedUser.preferences,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { registerUser, loginUser, getMe, updateProfile };
