import { PrismaClient, type post } from "@prisma/client";
import { uploadImageToS3 } from "~/utils/awsfunctions";
import * as crypto from "crypto";
import { getSsmParameter } from "~/utils/awsfunctions";
import { decodeBase64Image, decodedBase64ImageMimeType } from "~/server/utils/decodeBase64";
import { decodeApiEvent } from "~/server/utils/decodeToken";

export default defineEventHandler(async (event) => {
  // トークンをデコードしてユーザー情報を取得
  const decoded = await decodeApiEvent(event);
  /** リクエストボディ */
  const body = await readMultipartFormData(event);
  if (!body || body.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Image Not Found",
    });
  }
  let maskHeart = null;
  let maskRepost = null;
  let postBody = null;
  const prisma = new PrismaClient();
  // 投稿文を保存するループ
  for (let i = 0; i < body.length; i++) {
    if (body[i].name === "postBody") {
      postBody = body[i].data.toString();
    } else if (body[i].name === "maskHeart") {
      maskHeart = Number(body[i].data);
    } else if (body[i].name === "maskRepost") {
      maskRepost = Number(body[i].data);
    }
  }
  if (postBody === null) return { code: 64 }; // 本文なし
  const postInfo = await prisma.post.create({
    data: {
      user_table_id: decoded.userTableId,
      body_ja: postBody,
      mask_heart: maskHeart,
      mask_repost: maskRepost,
    },
  });
  if (postInfo === null) {
    return { code: 90 }; // DBインサートエラー
  }

  // 保存した画像のURL一覧リスト
  const imageUrlList: string[] = [];
  /** SSMからバケットURLを取得 */
  const s3BucketBaseUrl = await getSsmParameter("/MASKEDUP/S3_BUCKET_BASE_URL");
  // 画像をアップロード・情報保存するループ
  for (let i = 0; i < body.length; i++) {
    if (body[i].name === "imageList") {
      // Base64エンコードされた画像データをデコード
      const imageBuffer = Buffer.from(decodeBase64Image(body[i].data.toString()) ?? "", "base64");
      // MIMEタイプを取得
      const imageMimeType = decodedBase64ImageMimeType(body[i].data.toString());
      const filename = "post/" + crypto.randomUUID();
      const result = await uploadImageToS3(
        filename,
        imageBuffer,
        imageMimeType ?? "image/jpeg"
      );
      if (result !== null) {
        const postImageInfo = await prisma.post_image.create({
          data: {
            post_table_id: postInfo.id,
            user_table_id: decoded.userTableId,
            image_url: filename,
          },
        });
        imageUrlList.push(s3BucketBaseUrl + filename);
      } else {
        return { code: 91 }; // S3アップロードエラー
      }
    }
  }
  return {
    code: 0,
    postInfo: {
      id: Number(postInfo.id),
      created_at: postInfo.created_at,
      body_ja: postInfo.body_ja,
      user_id: decoded.username,
      user_name: decoded.name,
      icon_image: decoded.picture,
      repost_count: postInfo.mask_repost ?? 0,
      repost_id: 0,
      good_count: postInfo.mask_heart ?? 0,
      good_id: 0,
      image_url: imageUrlList.length !== 0 ? imageUrlList : null,
      reposted_user_name: null,
    },
  };
});
