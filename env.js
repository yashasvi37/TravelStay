const { cleanEnv, str, url, port } = require("envalid");
require("dotenv").config(); // Ensure dotenv runs first so process.env is populated

const env = cleanEnv(process.env, {
  MONGO_URI: str({ devDefault: "mongodb://127.0.0.1:27017/travelstay", desc: "MongoDB Connection URI" }),
  JWT_SECRET: str({ devDefault: "fallback-secret-key", desc: "Secret for signing JWTs" }),
  REFRESH_SECRET: str({ devDefault: "fallback-refresh-secret-key", desc: "Secret for signing Refresh Tokens" }),
  CLOUDINARY_CLOUD_NAME: str({ desc: "Cloudinary cloud name" }),
  CLOUDINARY_API_KEY: str({ desc: "Cloudinary API key" }),
  CLOUDINARY_API_SECRET: str({ desc: "Cloudinary API secret" }),
  FRONTEND_URL: url({ devDefault: "http://localhost:5173", desc: "Frontend origin URL for CORS" }),
  PORT: port({ default: 3001, desc: "Server port" }),
  REDIS_URL: url({ devDefault: "redis://127.0.0.1:6379", desc: "Redis connection URL" }),
});

module.exports = env;
