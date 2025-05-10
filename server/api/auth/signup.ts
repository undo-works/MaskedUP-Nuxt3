import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { UserSubmitProps } from "~/types/auth";

/**
 * ユーザ登録
 */
export default defineEventHandler(async (event) => {
  /** リクエストボディ */
  const body = (await readBody(event)) as UserSubmitProps;
  // ソルト生成
  const salt = await bcrypt.genSalt();
  // ハッシュ化
  const hashed = await bcrypt.hash(body.password, salt);
  try {
    const prisma = new PrismaClient();
    // エンドユーザの追加
    await prisma.enduser.create({
      data: {
        user_id: body.userId,
        user_name: body.userName,
        password: hashed,
      },
    });
    return { code: 0 }; // 成功
  } catch (error) {
    return { code: 90 }; // DBエラー
  }
});
