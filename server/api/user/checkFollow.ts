import { PrismaClient, type follow } from "@prisma/client";
import type { userCheckFollowRequest } from "~/types/user";
import { decodeApiEvent } from "~/server/utils/decodeToken";

export default defineEventHandler(async (event) => {
  // トークンをデコードしてユーザー情報を取得
  const decoded = await decodeApiEvent(event);

  // パラメタ取得
  const body = (await readBody(event)) as userCheckFollowRequest;
  // DBからユーザ情報取得
  const prisma = new PrismaClient();
  const userInfo = await prisma.$queryRaw<follow[]>`
SELECT
  f.id
  , f.created_at
  , f.following_user_table_id
  , f.followed_user_table_id 
FROM
  follow f 
  INNER JOIN enduser eu 
      on f.followed_user_table_id = eu.id 
      AND eu.user_id = ${body.userId} 
WHERE
  f.following_user_table_id = ${decoded.userTableId};
  `;
  return {
    // フォローしてたらtrue
    isFollowing: userInfo.length !== 0,
  };
});
