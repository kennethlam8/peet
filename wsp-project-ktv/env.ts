import dotenv from "dotenv";
dotenv.config();


const env = {
    DB_NAME: process.env.DB_NAME || "pet_social_media",
    DB_USERNAME: process.env.DB_USERNAME || "postgres",
    DB_PASSWORD: process.env.DB_PASSWORD || "postgres",
    SESSION_SECRET: process.env.SESSION_SECRET || "project",
    GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET

};

export default env;