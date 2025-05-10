import { PrismaClient, Prisma } from "@prisma/client";
import type { RecommendComputed, RecommendPostEntity } from "~/types/recommend";
import similarity from "compute-cosine-similarity";
import type { NewPostListEntity } from "~/types/post";
import { getSsmParameter } from "~/utils/awsfunctions";
import { decodeApiEvent } from "~/server/utils/decodeToken";

export default defineEventHandler(async (event) => {
  // トークンをデコードしてユーザー情報を取得
  const decoded = await decodeApiEvent(event);

  // DBから一覧取得
  const prisma = new PrismaClient();
  const entities = await prisma.$queryRaw<RecommendPostEntity[]>`
SELECT
  eu.id
  , GROUP_CONCAT( 
      CASE 
          WHEN p.id = g.post_table_id 
          AND p.id = rps.post_table_id 
              THEN 4 
          WHEN p.id = rps.post_table_id 
              THEN 3 
          WHEN p.id = g.post_table_id 
              THEN 2 
          ELSE 1 
          END
  ) AS isGood 
FROM
  enduser eu 
  INNER JOIN ( 
      SELECT
          MAX(g.id)
          , g.user_table_id 
      FROM
          good g 
      GROUP BY
          g.user_table_id
  ) ing ON eu.id = ing.user_table_id
  CROSS JOIN post p 
  LEFT JOIN good g 
      ON eu.id = g.user_table_id 
      AND p.id = g.post_table_id 
  LEFT JOIN t_repost rps 
      ON eu.id = rps.user_table_id 
      AND p.id = rps.post_table_id 
GROUP BY
  eu.id;
  `;
  const computedArr: RecommendComputed[] = [];
  const myEntity = entities.find(
    (entity) => Number(entity.id) === decoded.userTableId
  );
  if (myEntity === undefined) {
    return { code: 63, postList: [] }; // ユーザ情報なし
  }
  const myArray: number[] = myEntity.isGood.split(",").map((isGoodStr) => {
    return +isGoodStr;
  });
  entities.map((entity) => {
    const result = similarity(
      myArray,
      entity.isGood.split(",").map((isGoodStr) => {
        return +isGoodStr;
      })
    );
    computedArr.push({ id: Number(entity.id), similarity: result ?? 0 });
  });
  computedArr.sort((a, b) => b.similarity - a.similarity);
  computedArr.shift(); // 先頭は自身のデータなので削除
  computedArr.slice(0, 4);
  const numarrComp = computedArr.map((comp) => comp.id);
  console.log(numarrComp);
  const postList = await prisma.$queryRaw<NewPostListEntity[]>`
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
  INNER JOIN ( 
      SELECT
          g.post_table_id 
      FROM
          good g 
      WHERE
          g.created_at BETWEEN (NOW() - INTERVAL 1 WEEK) AND NOW() 
          AND g.user_table_id IN (${Prisma.join(numarrComp)})
      GROUP BY
          g.post_table_id
  ) newg 
      ON p.id = newg.post_table_id 
  INNER JOIN enduser eu 
      ON p.user_table_id = eu.id 
  LEFT JOIN ( 
      SELECT
          COUNT(id) as good_count
          , post_table_id 
      FROM
          good 
      GROUP BY
          post_table_id
  ) g 
      ON p.id = g.post_table_id 
      AND p.mask_heart IS NULL
  LEFT JOIN ( 
      SELECT
          id
          , post_table_id 
      FROM
          good g 
      WHERE
          g.user_table_id = ${decoded.userTableId}
  ) g2 
      ON p.id = g2.post_table_id 
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
          rpt.user_table_id = ${decoded.userTableId}
  ) rpt2 
      ON p.id = rpt2.post_table_id 
  LEFT JOIN post_image pi 
      ON p.id = pi.post_table_id 
GROUP BY
  p.id
  , g2.id
  , rpt2.id 
  `;
  /** SSMからバケットURLを取得 */
  const s3BucketBaseUrl = await getSsmParameter("/MASKEDUP/S3_BUCKET_BASE_URL");
  const converted = await Promise.all(
    postList.map(async (post) => {
      return {
        id: Number(post.id),
        created_at: post.created_at,
        body_ja: post.body_ja,
        user_id: post.user_id,
        user_name: post.user_name,
        icon_image: post.icon_image
          ? s3BucketBaseUrl + post.icon_image // アイコン画像URL
          : "/no_icon.svg",
        repost_count: Number(post.repost_count),
        repost_id: Number(post.repost_id),
        good_count: Number(post.good_count),
        good_id: Number(post.good_id), // IDがあればログインユーザがいいねしてる
        image_url:
          post.image_url?.split(",").map((imageUrl) => {
            return s3BucketBaseUrl + imageUrl;
          }) ?? null, // 画像URLリスト
        reposted_user_name: post.reposted_user_name ?? null,
      };
    })
  );
  return { postList: converted, code: 0 };
});
