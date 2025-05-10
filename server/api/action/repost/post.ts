import { PrismaClient } from "@prisma/client";
import type { GoodRequest } from "~/types/post";
import { decodeApiEvent } from "~/server/utils/decodeToken";

export default defineEventHandler(async (event) => {
  // トークンをデコードしてユーザー情報を取得
  const decoded = await decodeApiEvent(event);
  // パラメタ取得
  const body = (await readBody(event)) as GoodRequest;
  console.log(decoded);
  // トークンがデコードできなければreturn
  if (decoded === undefined) return;
  console.log(body);
  // DBに保存
  const prisma = new PrismaClient();
  if (body.isRegister) {
    const postInfo = await prisma.t_repost.create({
      data: {
        post_table_id: body.id,
        user_table_id: decoded.userTableId,
      },
    });
  } else {
    const postInfo = await prisma.t_repost.deleteMany({
      where: {
        post_table_id: body.id,
        user_table_id: decoded.userTableId,
      },
    });
  }

  return {
    code: 0,
  };
});
