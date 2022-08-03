import pg from "pg";
import env from './env'

export const client = new pg.Client({
    database: env.DB_NAME,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
  });
  

  export async function connectDB(){
    await client.connect()
    
  }