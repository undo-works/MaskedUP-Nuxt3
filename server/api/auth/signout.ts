export default defineEventHandler(async (event) => {
  console.log("logout");

  // 生存時間を0にして返すオプション
  const option = {
    maxAge: 0,
  };
  setCookie(event, "username", "", option);
  setCookie(event, "name", "", option);
  setCookie(event, "authorization", "", option);
  setCookie(event, "auth:refresh-token", "", option);
  return { status: "OK" };
});
