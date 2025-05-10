import { PrismaClient } from "@prisma/client";
import type { NewPostListEntity, PostSearchRequest } from "~/types/post";
import { getSsmParameter } from "~/utils/awsfunctions";
import { decodeApiEvent } from "~/server/utils/decodeToken";

export default defineEventHandler(async (event) => {
  // パラメタ取得
  const body = (await readBody(event)) as PostSearchRequest;
  if (body.searchText === "") return [];

  let decoded = null;
  // トークンをデコードしてユーザー情報を取得
  try {
    decoded = await decodeApiEvent(event);
  } catch (e) {}

  // DBから一覧取得
  const prisma = new PrismaClient();
  const postInfo = await prisma.$queryRaw<NewPostListEntity[]>`
  SELECT
  p.id
  , p.created_at
  , p.body_ja
  , eu.user_id
  , eu.user_name
  , eu.icon_image
  , IFNULL(p.mask_heart, g.good_count) AS good_count
  , g2.id as good_id
  , IFNULL(p.mask_repost, rpt.repost_count) AS repost_count
  , rpt2.id as repost_id
  , GROUP_CONCAT(pi.image_url) AS image_url
FROM
  post p 
  INNER JOIN enduser eu 
      ON p.user_table_id = eu.id 
  LEFT JOIN ( 
      SELECT
          COUNT(id) as good_count, post_table_id 
      FROM
          good 
      GROUP BY
          post_table_id
  ) g 
      ON p.id= g.post_table_id
      AND p.mask_heart IS NULL
  LEFT JOIN ( 
      SELECT
          id, post_table_id
      FROM
          good g
      WHERE g.user_table_id = ${decoded?.userTableId ?? 0}
  ) g2 
      ON p.id= g2.post_table_id
  LEFT JOIN ( 
        SELECT
            COUNT(id) as repost_count, post_table_id 
        FROM
            t_repost 
        GROUP BY
            post_table_id
    ) rpt 
        ON p.id= rpt.post_table_id
        AND p.mask_repost IS NULL
  LEFT JOIN ( 
        SELECT
            id, post_table_id
        FROM
            t_repost rpt
        WHERE rpt.user_table_id = ${decoded?.userTableId ?? 0}
    ) rpt2 
        ON p.id= rpt2.post_table_id
  LEFT JOIN post_image pi
        ON p.id = pi.post_table_id
  WHERE
      p.body_ja LIKE ${"%" + body.searchText + "%"}
  GROUP BY
  p.id
  , p.created_at
  , p.body_ja
  , eu.user_id
  , eu.user_name
  , eu.icon_image
  , g2.id
  , rpt2.id
  ORDER BY
      g.good_count DESC;
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
          : "/no_icon.svg", // 登録されていない場合
        repost_count: Number(post.repost_count),
        repost_id: Number(post.repost_id),
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

export const sanitizingFunc = (text: string) => {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};
