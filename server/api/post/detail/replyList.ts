import { PrismaClient } from "@prisma/client";
import type { NewPostListEntity, PostInfoRequest } from "~/types/post";
import { getSsmParameter } from "~/utils/awsfunctions";
import { decodeApiEvent } from "~/server/utils/decodeToken";

export default eventHandler(async (event) => {
  // トークンをデコードしてユーザー情報を取得
  const decoded = await decodeApiEvent(event);

  // パラメタ取得
  const body = (await readBody(event)) as PostInfoRequest;

  // DBから一覧取得
  const prisma = new PrismaClient();
  const postInfo = await prisma.$queryRaw<NewPostListEntity[]>`
  SELECT
  r.id
  , r.created_at
  , r.body_ja
  , eu.user_id
  , eu.user_name
  , eu.icon_image
  , g.good_count
  , g2.id as good_id 
  , GROUP_CONCAT(ri.image_url) AS image_url
FROM
  t_reply r 
  INNER JOIN enduser eu 
      ON r.user_table_id = eu.id 
  LEFT JOIN ( 
      SELECT
          COUNT(id) as good_count
          , reply_table_id 
      FROM
          reply_good 
      GROUP BY
          reply_table_id
  ) g 
      ON r.id = g.reply_table_id 
  LEFT JOIN ( 
      SELECT
          id
          , reply_table_id 
      FROM
          reply_good g 
      WHERE
          g.user_table_id = ${decoded?.userTableId}
  ) g2 
      ON r.id = g2.reply_table_id 
  LEFT JOIN reply_image ri
      ON r.id = ri.reply_table_id
WHERE
  r.post_table_id = ${body.postTableId}
GROUP BY
r.id
, eu.user_id
, g.good_count
, g2.id
  `;

  /** SSMからバケットURLを取得 */
  const s3BucketBaseUrl = await getSsmParameter("/MASKEDUP/S3_BUCKET_BASE_URL");
  const converted = await Promise.all(
    postInfo.map(async (post) => {
      return {
        id: Number(post.id),
        created_at: post.created_at,
        body_ja: post.body_ja,
        user_id: post.user_id,
        user_name: post.user_name,
        icon_image: post.icon_image
          ? s3BucketBaseUrl + post.icon_image // アイコン画像URL
          : "/no_icon.svg",
        repost_count: post.repost_count,
        good_count: Number(post.good_count),
        good_id: Number(post.good_id), // IDがあればログインユーザがいいねしてる
        image_url:
          post.image_url?.split(",").map((imageUrl) => {
            return s3BucketBaseUrl + imageUrl;
          }) ?? null, // 画像URLリスト
        reposted_user_name: null,
      };
    })
  );
  return converted;
});
