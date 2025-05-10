import { verify, type JwtPayload } from "jsonwebtoken";
import { TOKEN_TYPE } from "~/utils/constants";
import { type H3Event, type EventHandlerRequest } from "h3";

export const extractToken = (authHeaderValue: string) => {
  const [, token] = authHeaderValue.split(`${TOKEN_TYPE} `);
  return token;
};

/**
 * トークンのデコード
 * @param token
 * @param tokenKey
 * @returns
 */
export const decodeToken = (token: string | undefined, tokenKey: string) => {
  if (token === undefined) return null;
  try {

    const extractedToken = extractToken(token);
    return verify(extractedToken, tokenKey) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * APIイベントからトークンをデコードする
 * @param event 
 */
export const decodeApiEvent = async (event: H3Event<EventHandlerRequest>) => {
  // アクセストークンのシークレットを取得
  const ACCESS_TOKEN_SECRET = await getSsmParameter("/MASKEDUP/ACCESS_TOKEN_SECRET");
  // トークンからユーザーIDを取得
  const cookieToken = getCookie(event, "authorization") ?? "";
  const decoded = decodeToken(cookieToken, ACCESS_TOKEN_SECRET);
  if (decoded !== null && decoded !== undefined) {
    // トークンがデコードできた場合は、ユーザー情報を返す
    return decoded;
  } else {
    // トークンがデコードできなければエラーを返す
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }
}