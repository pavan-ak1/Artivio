import ws from "ws";
import jwt,{JwtPayload} from 'jsonwebtoken';
import dotenv from 'dotenv';
import {JWT_SECRET} from "@repo/backend-common/config"
dotenv.config();

const wss  = new ws.WebSocketServer({port:8080});



wss.on("connection", (ws,request)=>{
    const url = request.url;
    if(!url){
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token');
    if(!token) throw new Error("Token not present");
     const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
     if(!decoded || !decoded.userId){
        ws.close();
        return;
        
     }
    ws.on('message',(data)=>{
        ws.send('pong');
    })
})