export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  jwt: {
    prefix: process.env.JWT_PREFIX || 'Bearer',
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    resetSecret: process.env.JWT_RESET_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    resetExpiresIn: process.env.JWT_RESET_EXPIRES_IN || '15m',
  },
  encryption: {
    secretKey: process.env.ENCRYPTION_SECRET_KEY,
    ivLength: parseInt(process.env.IV_LENGTH || '12', 10),
  },
});
