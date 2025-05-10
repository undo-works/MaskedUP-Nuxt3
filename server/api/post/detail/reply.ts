import { PrismaClient } from "@prisma/client";
import { uploadImageToS3 } from "~/utils/awsfunctions";
import * as crypto from "crypto";
import { getSsmParameter } from "~/utils/awsfunctions";
import { decodeApiEvent } from "~/server/utils/decodeToken";

/**
 * リプライ送信関数
 */
export default defineEventHandler(async (event) => {
  // トークンをデコードしてユーザー情報を取得
  const decoded = await decodeApiEvent(event);

  /** リクエストボディ(formdata) */
  const body = await readMultipartFormData(event);
  if (!body || body.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Image Not Found",
    });
  }
  let postTableId = 0;
  let bodyJa = null;
  // 投稿文とリプライ先投稿テーブルIDを取得
  for (let i = 0; i < body.length; i++) {
    if (body[i].name === "replyBody") {
      bodyJa = body[i].data.toString();
    } else if (body[i].name === "postTableId") {
      postTableId = Number(body[i].data);
    }
  }
  if (postTableId === 0 || bodyJa === null) return { code: 92 }; // formdataの読み込み失敗

  // DBに保存
  const prisma = new PrismaClient();
  const replyInfo = await prisma.t_reply.create({
    data: {
      post_table_id: postTableId,
      user_table_id: decoded?.userTableId,
      body_ja: bodyJa,
    },
  });
  if (replyInfo === null) return { code: 90 }; // DBインサートエラー

  // 保存した画像のURL一覧リスト
  const imageUrlList: string[] = [];
  /** SSMからバケットURLを取得 */
  const s3BucketBaseUrl = await getSsmParameter("/MASKEDUP/S3_BUCKET_BASE_URL");
  // 画像をアップロード・情報保存するループ
  for (let i = 0; i < body.length; i++) {
    if (body[i].name === "imageList") {
      const filename = "reply/" + crypto.randomUUID();
      const result = await uploadImageToS3(
        filename,
        body[i].data,
        body[i].type ?? "image/png"
      );
      if (result !== null) {
        const postImageInfo = await prisma.reply_image.create({
          data: {
            reply_table_id: replyInfo.id,
            user_table_id: decoded?.userTableId,
            image_url: filename,
          },
        });
        if (postImageInfo === null) return { code: 90 }; // リプライ画像情報保存失敗
        imageUrlList.push(s3BucketBaseUrl + filename);
      } else {
        return { code: 91 }; // S3アップロードエラー
      }
    }
  }
  return {
    code: 0,
    postInfo: {
      id: Number(replyInfo.id),
      created_at: replyInfo.created_at,
      body_ja: replyInfo.body_ja,
      user_id: decoded?.username,
      user_name: decoded?.name,
      icon_image: decoded?.picture,
      repost_count: 0,
      repost_id: 0,
      good_count: 0,
      good_id: 0,
      image_url: imageUrlList.length !== 0 ? imageUrlList : null,
      reposted_user_name: null,
    },
  };
});
