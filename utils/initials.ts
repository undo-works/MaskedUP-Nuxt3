import type { UserInfoResponse } from "~/types/user";

export const initialUserInfo: UserInfoResponse = {
  createdAt: undefined,
  userId: " ",
  userName: " ",
  introduce: " ",
  iconImageUrl: "/no_icon.svg",
  backImageUrl: "/long_no_image.svg",
  followerNumber: 0, // フォロワー数
  followingNumber: 0, // フォロー数
};
