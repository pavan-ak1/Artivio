import dotenv from 'dotenv'
dotenv.config({ path: '../../.env' });

export const JWT_SECRET = process.env.JWT_SECRET
export const JWT_EXPIRE = "1d"

export const NODE_ENV = process.env.NODE_ENV;