import { PrismaClient } from "@prisma/client";
import { getSsmParameter } from "~/utils/awsfunctions";
import { decodeApiEvent } from "~/server/utils/decodeToken";

export default defineEventHandler(async (event) => {
  // トークンをデコードしてユーザー情報を取得
  const decoded = await decodeApiEvent(event);
  
  // DBからユーザ情報取得
  const prisma = new PrismaClient();
  const userInfo = await prisma.enduser.findUniqueOrThrow({
    where: {
      user_id: decoded.username,
    },
  });
  // フォロワーカウント
  const countFollower = await prisma.follow.count({
    where: {
      followed_user_table_id: decoded.userTableId,
    },
  });
  // フォロー中カウント
  const countFollowing = await prisma.follow.count({
    where: {
      following_user_table_id: decoded.userTableId,
    },
  });
  /** SSMからバケットURLを取得 */
  const s3BucketBaseUrl = await getSsmParameter("/MASKEDUP/S3_BUCKET_BASE_URL");
  /** アイコン画像URL */
  const iconImageUrl = userInfo.icon_image
    ? s3BucketBaseUrl + userInfo.icon_image // アイコン画像URL
    : "/no_icon.svg"; // 登録されていない場合
  /** 背景画像URL */
  const backImageUrl = userInfo.back_image
    ? s3BucketBaseUrl + userInfo.back_image // 背景画像URL
    : "/long_no_image.svg"; // 登録されていない場合
  return {
    userId: userInfo?.user_id,
    userName: userInfo?.user_name,
    createdAt: userInfo?.created_at,
    introduce: userInfo?.introduce_ja,
    iconImageUrl: iconImageUrl,
    backImageUrl: backImageUrl,
    followerNumber: countFollower, // フォロワー数
    followingNumber: countFollowing, // フォロー数
  };
});
