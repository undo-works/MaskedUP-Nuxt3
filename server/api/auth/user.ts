import { createError, H3Event } from "h3";
import { decodeApiEvent } from "~/server/utils/decodeToken";

const ensureAuth = async (event: H3Event) => {

  try {
    // トークンをデコードしてユーザー情報を取得
    const decoded = await decodeApiEvent(event);
    return decoded;
  } catch (error) {
    console.error("Login failed. Here's the raw error:", error);
    throw createError({
      statusCode: 403,
      statusMessage: "You must be logged in to use this endpoint",
    });
  }
};

export default defineEventHandler(async (event) => {
  const user = ensureAuth(event);
  return user;
});
