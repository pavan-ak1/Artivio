import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import {JWT_SECRET} from "@repo/backend-common/config"

//we are declaring it as global as we need to add userId as string 
//accepting userId as string
declare global {
  namespace Express {
    interface Request {
      userId: number;
    }
  }
}


export const authenticateUser = async(req:Request,res:Response, next:NextFunction)=>{
try{
    const token =req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
    req.userId = decoded.id || decoded.userId;
    next();
}catch(error){
    return res.status(403).json({message:"Invalid session"});
}
    
}