module.exports = {
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  jwtExpiration: '7d', // Token expires in 7 days
  
  // MongoDB Atlas configuration
  mongoURI: process.env.MONGO_URI,
  
  // Server configuration
  port: process.env.PORT || 5000,
  
  // Cors configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};

