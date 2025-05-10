import { PrismaClient } from "@prisma/client";
import type { NewPostListEntity, PostInfoRequest } from "~/types/post";
import { getSsmParameter } from "~/utils/awsfunctions";
import { decodeApiEvent } from "~/server/utils/decodeToken";

/**
 * ユーザ詳細画面の情報取得
 */
export default defineEventHandler(async (event) => {
  // トークンをデコードしてユーザー情報を取得
  const decoded = await decodeApiEvent(event);

  // パラメタ取得
  const body = (await readBody(event)) as PostInfoRequest;
  // DBからユーザ情報取得
  const prisma = new PrismaClient();
  const postInfoList = await prisma.$queryRaw<NewPostListEntity[]>`
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
      WHERE g.user_table_id = ${decoded?.userTableId}
  ) g2 
      ON p.id= g2.post_table_id
  LEFT JOIN ( 
        SELECT
            COUNT(id) as repost_count
            , post_table_id 
        FROM
            t_repost 
        GROUP BY
            post_table_id
    ) rpt 
        ON p.id = rpt.post_table_id 
        AND p.mask_repost IS NULL
  LEFT JOIN ( 
        SELECT
            id
            , post_table_id 
        FROM
            t_repost rpt 
        WHERE
            rpt.user_table_id = ${decoded?.userTableId}
    ) rpt2 
        ON p.id = rpt2.post_table_id 
  LEFT JOIN post_image pi
        ON p.id = pi.post_table_id
WHERE
    p.id = ${body.postTableId}
  GROUP BY
    p.id
    , eu.user_id
    , g2.id
    , rpt2.id

  `;

  const postInfo = postInfoList[0];

  /** SSMからバケットURLを取得 */
  const s3BucketBaseUrl = await getSsmParameter("/MASKEDUP/S3_BUCKET_BASE_URL");
  return {
    id: Number(postInfo?.id),
    user_id: postInfo?.user_id,
    user_name: postInfo?.user_name,
    created_at: postInfo?.created_at,
    icon_image: s3BucketBaseUrl + postInfo?.icon_image,
    body_ja: postInfo?.body_ja,
    image_url:
      postInfo.image_url?.split(",").map((imageUrl) => {
        return s3BucketBaseUrl + imageUrl;
      }) ?? null, // 画像URLリスト
    repost_count: Number(postInfo.repost_count),
    repost_id: Number(postInfo.repost_id),
    good_count: Number(postInfo.good_count),
    good_id: Number(postInfo.good_id), // IDがあればログインユーザがいいねしてる
  };
});
