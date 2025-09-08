import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response } from "express";
import { httpUrl, z } from "zod";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { JWT_EXPIRE,JWT_SECRET,NODE_ENV } from "@repo/backend-common/config";
import {CreateUserSchema, SigninSchema} from "@repo/common/types"


const prisma = new PrismaClient();


//now here we are creating a helper function which generated a token
//taking our jwt key and payload and jwt expiry hard coded or from env

const generateToken = (userId: number, email: string) => {
  const payload = { id: userId, email };
  const secret = JWT_SECRET as string;
  const expiresIn = (JWT_EXPIRE || "1d") ;
  const options: SignOptions = {
    expiresIn:expiresIn as any
  };

  return jwt.sign(payload, secret, options);
};


//infering the zod though type because it is used to extract a TypeScript type directly from your Zod schema.


export const signup = async(req: Request, res: Response) => {
  const data = CreateUserSchema.safeParse(req.body);
  if(!data.success){
    res.json({
      message:"Incorrect inputs"
    });
    return;
  }
  const existingUser = await prisma.user.findUnique({
    
  })
  res.status(400).json()
};

export const signin = async (req: Request, res: Response) => {
  
};
