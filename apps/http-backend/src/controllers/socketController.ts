import { Request, Response } from "express";
import { CreateRoomSchema } from "@repo/common/types";
import { StatusCodes } from "http-status-codes";
import { prismaClient } from "@repo/db/client";

export const roomController = async (req: Request, res: Response) => {
  try {
    const data = CreateRoomSchema.safeParse(req.body);
    if (!data.success) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Incorrect room name",
      });
      return;
    }
    const userId = req.userId;

    const room = await prismaClient.room.create({
      data: {
        slug: data.data.name,
        adminId: userId,
      },
    });

    res.status(StatusCodes.CREATED).json({
      roomId: room.id,
      roomName: room.slug,
      adminId: room.adminId,
      createdAt: room.createdAt,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_GATEWAY).json({message:"Failed connecting to server"})
  }
};
