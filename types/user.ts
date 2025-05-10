export interface userInfoRequest {
  userId: string;
}

export interface userFollowRequest {
  userId: string;
  isRegister: boolean;
}

export interface UserInfoResponse {
  createdAt: Date | undefined;
  userId: string;
  userName: string;
  introduce: string | null;
  iconImageUrl: string;
  backImageUrl: string;
  followerNumber: number; // フォロワー数
  followingNumber: number; // フォロー数
}

/** フォローチェックリクエスト */
export interface userCheckFollowRequest {
  userId: string;
}

/** フォローチェックレスポンス */
export interface UserCheckFollowResponse {
  isFollowing: boolean;
}

/** ユーザ検索リクエスト */
export interface UserSearchRequest {
  searchText: string;
}

/** ユーザ検索結果レスポンス */
export interface UserSearchResponse {
  created_at: Date | undefined;
  user_id: string;
  user_name: string;
  icon_image: string;
  introduce_ja: String | null;
  isFollowing: number;
}

/** ユーザ情報変更リクエスト */
export interface ChangeProfileRequest {
  userName: string;
  introduce: string;
  iconImage: File;
  backImage: File;
}
