import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
  open_router_api_key: process.env.OPEN_ROUTER_API_KEY,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  stripe_webHook_secret: process.env.STRIPE_WEBHOOK_SECRET,
  
  emailSender: {
    host: process.env.EMAIL_HOST,
    email: process.env.EMAIL,
    app_pass: process.env.APP_PASS,
  },
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
    refresh_token_secret: process.env.JWT_REFRESH_SECRET,
    refresh_token_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    reset_pass_secret: process.env.RESET_PASS_SECRET,
    reset_pass_token_expires_in: process.env.RESET_PASS_SECRET_EXPIRES_IN,
  },
  salt_round: process.env.SALT_ROUND,
  reset_pass_link: process.env.RESET_PASS_LINK,
};
