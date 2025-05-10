import { PrismaClient } from "@prisma/client";
import type { UserSearchRequest, UserSearchResponse } from "~/types/user";
import { getSsmParameter } from "~/utils/awsfunctions";
import { decodeApiEvent } from "~/server/utils/decodeToken";

export default defineEventHandler(async (event) => {
  let decoded = null;
  // トークンをデコードしてユーザー情報を取得
  try {
    decoded = await decodeApiEvent(event);
  } catch (e) {}

  // パラメタ取得
  const body = (await readBody(event)) as UserSearchRequest;
  if (body.searchText === "") return [];
  // DBからユーザ情報取得
  const prisma = new PrismaClient();
  const userInfoList = await prisma.$queryRaw<UserSearchResponse[]>`
SELECT
  eu.user_id
  , eu.user_name
  , eu.created_at
  , eu.introduce_ja 
  , eu.icon_image
  , CASE  
  WHEN f.id IS NOT NULL THEN 1
  ELSE 0
  END AS isFollowing 
FROM
  enduser eu 
  LEFT JOIN follow f 
      on eu.id = f.followed_user_table_id 
      AND f.following_user_table_id = ${decoded?.userTableId ?? 0}
WHERE
  eu.user_id LIKE ${"%" + body.searchText + "%"} 
  OR eu.user_name LIKE ${"%" + body.searchText + "%"} 
  OR eu.introduce_ja LIKE ${"%" + body.searchText + "%"};
  `;
  /** SSMからバケットURLを取得 */
  const s3BucketBaseUrl = await getSsmParameter("/MASKEDUP/S3_BUCKET_BASE_URL");
  const converted = userInfoList.map(async (user) => {
    user.icon_image = user.icon_image
      ? s3BucketBaseUrl + user.icon_image // アイコン画像URL
      : "/no_icon.svg"; // 登録されていない場合
    user.isFollowing = Number(user.isFollowing);
    return user;
  });
  return converted;
});
