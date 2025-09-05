import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response } from "express";
import { httpUrl, z } from "zod";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//creating a signin schema though zod where it allows us to create specific type request through client.
export const signinSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password required"),
});

//creating a signup schema though zod where it allows us to create specific type request through client.
export const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

//now here we are creating a helper function which generated a token
//taking our jwt key and payload and jwt expiry hard coded or from env

const generateToken = (userId: number, email: string) => {
  const payload = { id: userId, email };
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRE || "1d") ;
  const options: SignOptions = {
    expiresIn:expiresIn as any
  };

  return jwt.sign(payload, secret, options);
};


//infering the zod though type because it is used to extract a TypeScript type directly from your Zod schema.
type SignupSchema = z.infer<typeof signupSchema>;

type SigninSchema = z.infer<typeof signinSchema>;

export const signup = async(req: Request, res: Response) => {
  //Zod provides two ways to validate:
  //parse → throws an error if validation fails.
  //safeParse → never throws, instead returns a structured object.
  
  const result = signupSchema.safeParse(req.body);
  
  if(!result.success){
    return res.status(400).json({errors:result.error});
  }
  
  const {email,password} = result.data;
  try{

    //step1 we are checking for a existing user 
    const existingUser = await prisma.user.findUnique({where:{email}});

    if(existingUser){
      return res.status(400).json({error:'User already exists'});
    }

    //now hashing password for safety of injection inside database attack 
    const hashedPassword = await bcrypt.hash(password,10);

    //save user in Db creating user in db
    const user = await prisma.user.create({
      data:{
        email,
        password:hashedPassword,
      }
    });

    const token =generateToken(user.id,user.email);
    res.cookie("token", token,{
      httpOnly:true,
      secure:process.env.NODE_ENV === "production", 
      sameSite:"strict",
      maxAge:24*60*60*1000,
    });

    return res.status(200).json({token:token, message:"signup successful", user:{id:user.id, email:user.email}})
  }catch(error){
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const signin = async (req: Request, res: Response) => {
  const result = signinSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error });
  }

  const { email, password } = result.data;

  try {
    const user = await prisma.user.findUnique({where:{email}});
    if(!user){
      return res.status(400).json({error:"user not found"});
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
      res.status(400).json({error:"Wrong Password"});
    }
    const token = generateToken(user.id, user.email);

    res.cookie("token", token, {
      httpOnly:true,
      secure:process.env.NODE_ENV === "production",
      sameSite:"strict",
      maxAge:24*60*60*1000,
    })

    res.status(200).json({token:token,message:"Login Successfull", user:{id:user.id, email:user.email}})
  } catch (err) {
    console.log(err);
     return res.status(500).json({ error: "Server error" });
  }
};
