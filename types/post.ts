export interface PostWriteResponse {
  code: number;
  postInfo: PostListResponse;
}

export interface GoodRequest {
  id: number;
  isRegister: boolean;
}

/**
 * 投稿一覧取得(TimeLine)
 */
export interface PostListResponse {
  id: number;
  created_at: Date;
  body_ja: string;
  user_id: string;
  user_name: string;
  icon_image: string;
  repost_count: number;
  repost_id: number;
  good_count: number;
  good_id: number;
  image_url: string[];
  reposted_user_name: string | null;
}

/**
 * 投稿一覧取得(TimeLine)
 */
export interface NewPostListEntity {
  id: number;
  created_at: Date;
  body_ja: string;
  user_id: string;
  user_name: string;
  icon_image: string;
  repost_count: number;
  repost_id: number;
  good_count: number;
  good_id: number;
  image_url: string | null;
  reposted_user_name: string | null;
}

/**
 * 投稿検索リクエスト
 */
export interface PostSearchRequest {
  searchText: string; // 検索文字列
}

/** ユーザごとの投稿リストリクエスト */
export interface UserPostListRequest {
  userId: string;
}

/** 投稿一件の情報取得リクエスト */
export interface PostInfoRequest {
  postTableId: number;
}

/**
 * リプライ一覧取得
 */
export interface ReplyListResponse {
  id: number;
  replyTo: number; // リプライ先のリプライID
  created_at: Date;
  body_ja: string;
  user_id: string;
  user_name: string;
  icon_image: string;
  repost_count: number;
  good_count: number;
  good_id: number;
  image_url: string[];
}