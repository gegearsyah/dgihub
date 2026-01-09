/**
 * Express Backend for DGIHub
 * Deploy this separately to Render, Railway, or Fly.io
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://dgihub-test.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '24h'
  });
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId, type: 'refresh' }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// POST /api/v1/auth/login
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, email, password_hash, full_name, user_type, status, email_verified')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (user.status !== 'ACTIVE' && user.status !== 'VERIFIED') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status.toLowerCase()}. Please verify your account.`
      });
    }

    // Generate tokens
    const token = generateToken({
      userId: user.user_id,
      email: user.email,
      userType: user.user_type,
      fullName: user.full_name
    });

    const refreshToken = generateRefreshToken(user.user_id);

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('user_id', user.user_id);

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.user_id,
          email: user.email,
          fullName: user.full_name,
          userType: user.user_type,
          status: user.status
        },
        expiresIn: 86400
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
});

// POST /api/v1/auth/register
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, userType, nik, phone } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    if (!fullName || fullName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }

    if (!['TALENTA', 'MITRA', 'INDUSTRI'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type'
      });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date();
    verificationCodeExpires.setHours(verificationCodeExpires.getHours() + 24);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name: fullName,
        user_type: userType,
        status: 'PENDING_VERIFICATION',
        verification_code: verificationCode,
        verification_code_expires_at: verificationCodeExpires.toISOString()
      })
      .select('user_id, email, full_name, user_type, status')
      .single();

    if (userError || !user) {
      console.error('User creation error:', userError);
      return res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }

    // Create profile based on user type
    if (userType === 'TALENTA') {
      await supabase.from('talenta_profiles').insert({
        user_id: user.user_id,
        nik: nik || null,
        phone: phone || null
      });
    } else if (userType === 'MITRA') {
      await supabase.from('mitra_profiles').insert({
        user_id: user.user_id
      });
    } else if (userType === 'INDUSTRI') {
      await supabase.from('industri_profiles').insert({
        user_id: user.user_id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your account.',
      data: {
        userId: user.user_id,
        email: user.email,
        userType: user.user_type,
        status: user.status,
        verificationRequired: true
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DGIHub Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

