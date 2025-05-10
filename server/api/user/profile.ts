import { PrismaClient } from "@prisma/client";
import { uploadImageToS3 } from "~/utils/awsfunctions";
import * as crypto from "crypto";
import { decodeBase64Image, decodedBase64ImageMimeType } from "~/server/utils/decodeBase64";
import { decodeApiEvent } from "~/server/utils/decodeToken";

/**
 * ユーザ情報の変更
 */
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

  const prisma = new PrismaClient();
  /** 現在のエンドユーザ情報 */
  const userInfo = await prisma.enduser.findUniqueOrThrow({
    where: {
      user_id: decoded.username,
    },
  });

  for (let i = 0; i < body.length; i++) {
    if (body[i].name === "userName") {
      userInfo.user_name = body[i].data.toString();
    } else if (body[i].name === "introduce") {
      userInfo.introduce_ja = body[i].data.toString();
    } else if (body[i].name === "iconImage") {
      const filename = "icon/" + crypto.randomUUID();
      // Base64エンコードされた画像データをデコード
      const imageBuffer = Buffer.from(decodeBase64Image(body[i].data.toString()) ?? "", "base64");
      // MIMEタイプを取得
      const imageMimeType = decodedBase64ImageMimeType(body[i].data.toString());
      const result = await uploadImageToS3(
        filename,
        imageBuffer,
        imageMimeType ?? "image/jpeg"
      );
      if (result !== null) {
        userInfo.icon_image = filename;
      }
    } else if (body[i].name === "backImage") {
      const filename = "back/" + crypto.randomUUID();
      // Base64エンコードされた画像データをデコード
      const imageBuffer = Buffer.from(decodeBase64Image(body[i].data.toString()) ?? "", "base64");
      // MIMEタイプを取得
      const imageMimeType = decodedBase64ImageMimeType(body[i].data.toString());
      const result = await uploadImageToS3(
        filename,
        imageBuffer,
        imageMimeType ?? "image/jpeg"
      );
      if (result !== null) {
        userInfo.back_image = filename;
      }
    }
  }

  try {
    const prisma = new PrismaClient();
    // エンドユーザの追加
    await prisma.enduser.update({
      where: {
        user_id: decoded.username,
      },
      data: {
        user_name: userInfo.user_name,
        introduce_ja: userInfo.introduce_ja,
        icon_image: userInfo.icon_image,
        back_image: userInfo.back_image,
      },
    });
    return { code: 0 }; // 成功
  } catch (error) {
    console.log(error);
    return { code: 90 }; // DBエラー
  }
});
