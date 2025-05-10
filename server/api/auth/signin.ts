import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { UserLoginProps } from "~/types/auth";

import { createError, readBody } from "h3";
import { sign, type Secret } from "jsonwebtoken";

import { TOKEN_TYPE } from "~/utils/constants";
import { getSsmParameter } from "~/utils/awsfunctions";

export const ACCESS_TOKEN_EXPIRE = 60 * 60 * 24 * 7;

export default defineEventHandler(async (event) => {
  // パラメタ取得
  const body = (await readBody(event)) as UserLoginProps;
  // DBからユーザ情報取得
  const prisma = new PrismaClient();
  const userInfo = await prisma.enduser.findUnique({
    where: {
      user_id: body.username,
    },
  });
  if (userInfo === null) {
    // ユーザ情報なしエラー
    throw createError({
      statusCode: 403,
      statusMessage: "Unauthorized, maybe you don't have BotOR account",
    });
  }
  console.log(userInfo);
  // ハッシュ化して比較
  await bcrypt.compare(body.password, userInfo.password).then((res) => {
    if (!res) {
      // パスワード不一致
      throw createError({
        statusCode: 403,
        statusMessage: "Unauthorized, invalid your password",
      });
    }
  });
  const user = {
    userTableId: Number(userInfo.id),
    username: userInfo.user_id,
    picture: userInfo.icon_image
      ? await getSsmParameter("/MASKEDUP/S3_BUCKET_BASE_URL") + userInfo.icon_image // アイコン画像URL
      : null,
    name: userInfo.user_name,
  };

  setCookie(event, "username", userInfo.user_id, {
    secure: true,
    sameSite: "strict",
  });
  setCookie(event, "name", userInfo.user_name, {
    secure: true,
    sameSite: "strict",
  });

  const accessTokenExpireDate = new Date();
  accessTokenExpireDate.setSeconds(
    accessTokenExpireDate.getSeconds() + ACCESS_TOKEN_EXPIRE
  );
  // SSMからアクセストークンシークレットを取得
  const ACCESS_TOKEN_SECRET = await getSsmParameter("/MASKEDUP/ACCESS_TOKEN_SECRET");
  const accessToken = sign({ ...user, scope: ["user"] }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRE,
  });
  setCookie(event, "authorization", `${TOKEN_TYPE} ${accessToken}`, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    expires: accessTokenExpireDate,
  });

  return {
    token: {
      accessToken,
    },
  };
});
