import type { PostListResponse } from "./post";

/** レコメンドエンティティ */
export interface RecommendPostEntity {
  id: number;
  isGood: string;
}

/** レコメンドエンティティ */
export interface RecommendComputed {
  id: number;
  similarity: number;
}

/** レコメンド投稿リストレスポンス */
export interface RecommendPostResponse {
  code: number;
  postList: PostListResponse[];
}
