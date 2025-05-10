import { PrismaClient } from "@prisma/client";
import type { userInfoRequest } from "~/types/user";
import { getSsmParameter } from "~/utils/awsfunctions";

/**
 * ユーザ詳細画面の情報取得
 */
export default defineEventHandler(async (event) => {
  // パラメタ取得
  const body = (await readBody(event)) as userInfoRequest;
  // DBからユーザ情報取得
  const prisma = new PrismaClient();
  const userInfo = await prisma.enduser.findUnique({
    where: {
      user_id: body.userId,
    },
  });
  // フォロワーカウント
  const countFollower = await prisma.follow.count({
    where: {
      followed_user_table_id: userInfo?.id,
    },
  });
  // フォロー中カウント
  const countFollowing = await prisma.follow.count({
    where: {
      following_user_table_id: userInfo?.id,
    },
  });
  /** SSMからバケットURLを取得 */
  const s3BucketBaseUrl = await getSsmParameter("/MASKEDUP/S3_BUCKET_BASE_URL");
  return {
    userId: userInfo?.user_id,
    userName: userInfo?.user_name,
    createdAt: userInfo?.created_at,
    introduce: userInfo?.introduce_ja,
    iconImageUrl: userInfo?.icon_image
      ? s3BucketBaseUrl + userInfo.icon_image // アイコン画像URL
      : "/no_icon.svg",
    backImageUrl: userInfo?.back_image
      ? s3BucketBaseUrl + userInfo.back_image // 背景画像URL
      : "/long_no_image.svg",
    followerNumber: countFollower, // フォロワー数
    followingNumber: countFollowing, // フォロー数
  };
});
