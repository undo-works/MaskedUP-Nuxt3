import { PrismaClient } from "@prisma/client";
import type { NewPostListEntity } from "~/types/post";
import { getSsmParameter } from "~/utils/awsfunctions";
import { decodeApiEvent } from "~/server/utils/decodeToken";

export default eventHandler(async (event) => {
	// トークンをデコードしてユーザー情報を取得
	const decoded = await decodeApiEvent(event);

	// DBから一覧取得
	const prisma = new PrismaClient();
	// 普通の投稿取得
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
  INNER JOIN enduser eu 
	  ON p.user_table_id = eu.id 
  INNER JOIN follow f 
	  ON f.following_user_table_id = ${decoded.userTableId} 
	  AND p.user_table_id = f.followed_user_table_id 
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
WHERE
  p.created_at BETWEEN (NOW() - INTERVAL 1 WEEK) AND NOW() 
GROUP BY
  p.id
  , g2.id
  , rpt2.id;
  `;

	// リツイート取得
	const repostList = await prisma.$queryRaw<NewPostListEntity[]>`
SELECT
  p.id
  , tr.created_at
  , p.body_ja
  , posteu.user_id
  , posteu.user_name
  , posteu.icon_image
  , IFNULL(p.mask_heart, g.good_count) AS good_count
  , g2.id as good_id
  , IFNULL(p.mask_repost, rpt.repost_count) AS repost_count
  , rpt2.id as repost_id
  , treu.user_name as reposted_user_name
  , GROUP_CONCAT(pi.image_url) AS image_url 
FROM
  t_repost tr 
  INNER JOIN enduser treu 
	  ON tr.user_table_id = treu.id 
  INNER JOIN follow f 
	  ON f.following_user_table_id = ${decoded.userTableId} 
	  AND tr.user_table_id = f.followed_user_table_id 
  INNER JOIN post p 
	  ON tr.post_table_id = p.id 
  INNER JOIN enduser posteu 
	  ON p.user_table_id = posteu.id 
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
WHERE
  tr.created_at BETWEEN (NOW() - INTERVAL 1 WEEK) AND NOW() 
GROUP BY
  p.id
  , tr.created_at
  , g2.id
  , rpt2.id
  , treu.user_name
  `;

	// 自分の投稿取得
	const userPostList = await prisma.$queryRaw<NewPostListEntity[]>`
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
	  ON p.user_table_id = ${decoded.userTableId} 
	  AND p.user_table_id = eu.id 
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
WHERE
  p.created_at BETWEEN (NOW() - INTERVAL 1 WEEK) AND NOW() 
GROUP BY
  p.id
  , g2.id
  , rpt2.id
	`;

	// array_aとarray_bを結合
	const postInfo = [...postList, ...repostList, ...userPostList];

	// createdDateの降順に並べ替え
	postInfo.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

	const s3BucketBaseUrl = await getSsmParameter("/MASKEDUP/S3_BUCKET_BASE_URL");

	const converted = await Promise.all(
		postInfo.map(async (post) => {
			console.log(postInfo);
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
	return converted;
});
