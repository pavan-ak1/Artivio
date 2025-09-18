import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response } from "express";
import { httpUrl, z } from "zod";
import bcrypt from "bcryptjs";
import { prismaClient } from "@repo/db/client";
import { JWT_EXPIRE, JWT_SECRET, NODE_ENV } from "@repo/backend-common/config";
import { CreateUserSchema, SigninSchema } from "@repo/common/types";
import { StatusCodes } from "http-status-codes";

const prisma = new prismaClient();

//now here we are creating a helper function which generated a token
//taking our jwt key and payload and jwt expiry hard coded or from env

const generateToken = (userId: number, email: string) => {
  const payload = { id: userId, email };
  const secret = JWT_SECRET as string;
  const expiresIn = JWT_EXPIRE || "1d";
  const options: SignOptions = {
    expiresIn: expiresIn as any,
  };

  return jwt.sign(payload, secret, options);
};

//infering the zod though type because it is used to extract a TypeScript type directly from your Zod schema.

export const signup = async (req: Request, res: Response) => {
  try {
    const data = CreateUserSchema.safeParse(req.body);
    if (!data.success) {
      res.json({
        message: "Incorrect inputs",
      });
      return;
    }
    const { email, password, name } = data.data;
    if(!email || !password || !name){
      res.status(StatusCodes.CONFLICT).json({message:"All Fields Required"});
      return;
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (existingUser) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "User already exists" });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    const token = generateToken(newUser.id, email);
    res.status(201).json({
      message: "User created successfully",
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signin = async (req: Request, res: Response) => {
  
};
