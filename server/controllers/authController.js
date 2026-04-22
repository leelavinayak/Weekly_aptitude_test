const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../services/emailService');
const { notify } = require('../services/notificationService');
const templates = require('../utils/emailTemplates');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res) => {
    const { name, email, password, role, profilePic, collegeId, branch, year, collegeName } = req.body;

    if (role === 'admin') {
        return res.status(403).json({ message: 'Admin registration is not allowed. Contact the Programmers Club for admin access.' });
    }

    try {
        const { data: userExists, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .maybeSingle(); // maybeSingle doesn't error on zero rows

        if (checkError) throw checkError;
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const { data: user, error: insertError } = await supabase
            .from('users')
            .insert([{
                name,
                email,
                password: hashedPassword,
                role: role || 'student',
                profilePic,
                collegeId: collegeId || '',
                branch: branch || '',
                year: year || '',
                collegeName: collegeName || '',
                isVerified: role === 'admin' ? false : true 
            }])
            .select()
            .maybeSingle();

        if (insertError) throw insertError;
        if (!user) throw new Error('Failed to create user record');

        if (user) {
            // Trigger Welcome Notification
            if (user.role === 'student') {
                notify(user.id, 'success', 'Welcome to AIQuiz', 'Your account is ready. Exploration begins now.', {
                    html: templates.getWelcomeTemplate(user.name)
                });
            }

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePic: user.profilePic,
                collegeId: user.collegeId,
                branch: user.branch,
                year: user.year,
                collegeName: user.collegeName,
                token: generateToken(user.id)
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hardcoded admin credentials — only this account gets admin access
const ADMIN_EMAIL = 'programmersclub2026@gmail.com';
const ADMIN_PASSWORD = 'admin@vemu';

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // --- Special Admin Login (hardcoded credentials) ---
        if (email === ADMIN_EMAIL) {
            if (password !== ADMIN_PASSWORD) {
                return res.status(401).json({ message: 'Invalid admin credentials' });
            }

            let { data: adminUser } = await supabase
                .from('users')
                .select('*')
                .eq('email', ADMIN_EMAIL)
                .maybeSingle();

            if (!adminUser) {
                // Auto-create admin if doesn't exist
                const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
                const { data: newAdmin, error: createError } = await supabase
                    .from('users')
                    .insert([{
                        name: 'Programmers Club Admin',
                        email: ADMIN_EMAIL,
                        password: hashedPassword,
                        role: 'admin',
                        isVerified: true
                    }])
                    .select()
                    .maybeSingle();
                
                if (createError) throw createError;
                adminUser = newAdmin;
            }

            // Ensure role is always admin in case it was changed
            if (adminUser.role !== 'admin') {
                const { data: fixedAdmin } = await supabase
                    .from('users')
                    .update({ role: 'admin' })
                    .eq('id', adminUser.id)
                    .select()
                    .single();
                adminUser = fixedAdmin;
            }

            return res.json({
                _id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                role: 'admin',
                profilePic: adminUser.profilePic,
                token: generateToken(adminUser.id)
            });
        }

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isVerified) {
                return res.status(401).json({
                    message: 'Account not verified. Please verify your OTP.',
                    isPendingVerification: true
                });
            }
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: 'student',
                profilePic: user.profilePic,
                collegeId: user.collegeId,
                branch: user.branch,
                year: user.year,
                collegeName: user.collegeName,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (user) {
            const updates = {
                name: req.body.name || user.name,
                email: req.body.email || user.email,
                profilePic: req.body.profilePic !== undefined ? req.body.profilePic : user.profilePic,
                collegeId: req.body.collegeId !== undefined ? req.body.collegeId : user.collegeId,
                branch: req.body.branch !== undefined ? req.body.branch : user.branch,
                year: req.body.year !== undefined ? req.body.year : user.year,
                collegeName: req.body.collegeName !== undefined ? req.body.collegeName : user.collegeName
            };

            const { data: updatedUser, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            res.json({
                _id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                profilePic: updatedUser.profilePic,
                collegeId: updatedUser.collegeId,
                branch: updatedUser.branch,
                year: updatedUser.year,
                collegeName: updatedUser.collegeName
            });
        } else {
            res.status(404).json({ message: 'User record not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const { data: user } = await supabase.from('users').select('id').eq('email', email).single();
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await supabase.from('otps').insert([{
            email,
            otp: otpCode,
            type: 'forgot',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        }]);

        await sendEmail({
            email,
            subject: 'Password Reset OTP',
            message: `Your OTP is ${otpCode}`,
            html: templates.getOTPTemplate(otpCode, 'forgot')
        });

        res.json({ message: 'OTP sent to email' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const { data: otpRecord } = await supabase
            .from('otps')
            .select('*')
            .eq('email', email)
            .eq('otp', otp)
            .eq('type', 'forgot')
            .single();

        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await supabase.from('users').update({ password: hashedPassword }).eq('email', email);
        await supabase.from('otps').delete().eq('id', otpRecord.id);

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyRegistration = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const { data: otpRecord } = await supabase
            .from('otps')
            .select('*')
            .eq('email', email)
            .eq('otp', otp)
            .eq('type', 'register')
            .single();

        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

        const { data: user } = await supabase
            .from('users')
            .update({ isVerified: true })
            .eq('email', email)
            .select()
            .single();

        await supabase.from('otps').delete().eq('id', otpRecord.id);

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic,
            token: generateToken(user.id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerStudent, loginUser, updateProfile, forgotPassword, resetPassword, verifyRegistration };
