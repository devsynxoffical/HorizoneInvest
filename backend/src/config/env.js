const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const findEnv = () => {
  const paths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, "../../.env"),
    path.resolve(process.cwd(), "../.env"),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

const envPath = findEnv();
if (envPath) {
  dotenv.config({ path: envPath });
  console.log(`[Env] Loaded environment from: ${envPath}`);
} else {
  console.log("[Env] Warning: No .env file found. using environment variables or defaults.");
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientUrl: (process.env.CLIENT_URL || "https://horizoneinvest.com").replace(/\/$/, ""),
  frontendRoot: process.env.FRONTEND_ROOT || "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromName: process.env.SMTP_FROM_NAME || "Horizoneinvest",
    fromEmail: process.env.SMTP_FROM_EMAIL,
  },
};


module.exports = env;
