const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,                               // ← JS cannot access
  secure: process.env.NODE_ENV === 'production', // ← HTTPS only in prod
  sameSite: 'strict',                           // ← CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000               // 7 days
};

router.post('/api/auth/refresh-token', (req, res) => {
  // RefreshToken comes from httpOnly cookie (not JSON body)
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    // Generate new accessToken (short-lived)
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // IMPORTANT: Do NOT return refreshToken in response
    // It stays in the httpOnly cookie (browser sends it next time automatically)
    res.json({
      accessToken: newAccessToken,
      user: { userId: decoded.userId, role: decoded.role }
    });
  } catch (err) {
    // Invalid or expired refresh token → force re-login
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// Logout: clear refreshToken cookie
router.post('/api/auth/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
module.exports.REFRESH_COOKIE_OPTIONS = REFRESH_COOKIE_OPTIONS;

