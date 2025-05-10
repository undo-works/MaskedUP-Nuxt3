import { PrismaClient } from "@prisma/client";
import type {
  userFollowRequest,
} from "~/types/user";
import { decodeApiEvent } from "~/server/utils/decodeToken";

export default defineEventHandler(async (event) => {
  // トークンをデコードしてユーザー情報を取得
  const decoded = await decodeApiEvent(event);

  // パラメタ取得
  const body = (await readBody(event)) as userFollowRequest;
  // DBからユーザ情報取得
  const prisma = new PrismaClient();
  const userInfo = await prisma.enduser.findUniqueOrThrow({
    where: {
      user_id: body.userId,
    },
  });
  if (body.isRegister) {
    const postInfo = await prisma.follow.create({
      data: {
        following_user_table_id: decoded.userTableId,
        followed_user_table_id: userInfo.id,
      },
    });
  } else {
    const postInfo = await prisma.follow.deleteMany({
      where: {
        following_user_table_id: decoded.userTableId,
        followed_user_table_id: userInfo.id,
      },
    });
  }
  return {
    code: 0,
  };
});
