import { PrismaClient } from "@prisma/client";
import type { UserSubmitProps } from "~/types/auth";

/**
 * ユーザIDの重複チェック
 */
export default defineEventHandler(async (event) => {
  /** リクエストボディ */
  const body = (await readBody(event)) as UserSubmitProps;
  try {
    const prisma = new PrismaClient();
    /** エンドユーザ検索結果 */
    const userInfo = await prisma.enduser.findUnique({
      where: {
        user_id: body.userId,
      },
    });
    if (userInfo !== null) {
      return { code: 0 }; // 成功
    } else {
      return { code: 62 }; // 既に存在済み
    }
  } catch (error) {
    return { code: 90 }; // DBエラー
  }
});
