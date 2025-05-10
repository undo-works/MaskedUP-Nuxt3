import { PrismaClient } from "@prisma/client";
import type { PeelMaskRequest } from "~/types/action";

/** 実際のハートカウントとリポストカウント */
export default defineEventHandler(async (event) => {
  // パラメタ取得
  const body = (await readBody(event)) as PeelMaskRequest;
  // DBからユーザ情報取得
  const prisma = new PrismaClient();
  const goodCount = await prisma.good.count({
    where: {
      post_table_id: body.id,
    },
  });
  const repostCount = await prisma.t_repost.count({
    where: {
      post_table_id: body.id,
    },
  });
  return {
    goodCount: goodCount,
    repostCount: repostCount,
  };
});
