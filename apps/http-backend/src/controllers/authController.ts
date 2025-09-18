import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response } from "express";
import { httpUrl, z } from "zod";
import bcrypt from "bcryptjs";
import { prismaClient } from "@repo/db/client";
import { JWT_EXPIRE, JWT_SECRET, NODE_ENV } from "@repo/backend-common/config";
import { CreateUserSchema, SigninSchema } from "@repo/common/types";
import { StatusCodes } from "http-status-codes";

const prisma = prismaClient;

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
        errors: data.error.issues,
      });
      return;
    }
    const { email, password, name } = data.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (existingUser) {
      res.status(StatusCodes.CONFLICT).json({ message: "User already exists" });
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
    //putting generated token into cookies
    res
      .cookie("Token", token, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const signin = async (req: Request, res: Response) => {
  try {
    const data = SigninSchema.safeParse(req.body);
    if (!data.success) {
      return res
        .status(StatusCodes.NOT_ACCEPTABLE)
        .json({ message: "Incorrect inputs" });
    }
    const { email, password } = data.data;
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User does not exists sign up first" });
    }
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Password is invalid" });
    }
    const token = generateToken(user.id, user.email);
    res
      .cookie("Token", token, {
        httpOnly: true,
        secure: NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .status(StatusCodes.OK)
      .json({
        message: "User logged in successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
