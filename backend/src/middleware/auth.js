import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('Token verification failed:', err.message);
        return res.status(403).json({ error: 'Invalid token' });
      }

      // Set both user and userId for compatibility
      req.user = decoded;
      req.userId = decoded.userId;
      console.log('Authenticated user:', decoded);
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Keep the old auth middleware for backward compatibility
export const auth = authenticateToken; 