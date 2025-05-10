/** アカウント登録 */
export const AUTH_SIGNUP_URL = "/api/auth/signup";

/** ユーザIDの重複検索URL */
export const AUTH_DEDUPLICATION_URL = "/api/auth/deduplication";

/** ログイン */
export const AUTH_LOGIN_URL = "/api/auth/login";

/** アカウント情報変更 */
export const AUTH_CHANGE_PROFILE_URL = "/api/user/profile";

/** ポストの投稿 */
export const POST_SEND_URL = "/api/post/write";

/** リプライの投稿 */
export const REPLY_SEND_URL = "/api/post/detail/reply";

export const POST_LIST_URL = "/api/post/list";

/** ポスト一件の情報取得 */
export const POST_INFO_URL = "/api/post/detail/info";

/** リプライ一覧の情報取得 */
export const REPLY_LIST_URL = "/api/post/detail/replyList";

/** いいね */
export const GOOD_URL = "/api/action/good/post";

/** リプライへのいいね登録 */
export const REPLY_GOOD_URL = "/api/action/good/reply";

/** リポスト */
export const REPOST_URL = "/api/action/repost/post";

/** マスクの除去 */
export const PEEL_MASK_URL = "/api/action/mask";

export const USER_INFO_URL = "/api/user/info";

/** 自分のユーザー詳細情報取得URL */
export const USER_ME_URL = "/api/user/me";

/** ユーザごとの投稿一覧取得URL */
export const USER_POST_LIST_URL = "/api/post/userList";

/** フォロー中かチェック */
export const USER_CHECKFOLLOW_URL = "/api/user/checkFollow";

export const USER_FOLLOW_URL = "/api/user/follow";

/** 投稿検索 */
export const SEARCH_POST_LIST_URL = "api/post/search";

/** ユーザ検索 */
export const SEARCH_USER_LIST_URL = "api/user/search";

/** レコメンドの投稿取得 */
export const RECOMMEND_POST_LIST_URL = "/api/recommend/post"

/** アイコンなし */
export const NO_ICON_IMAGE = "/no_icon.svg";

/** トークン名称 */
export const AUTH_TOKEN_NAME = "authorization";

/** 
 * トークンタイプ
 * Bearerの後ろに半角スペースが入るので注意
 */
export const TOKEN_TYPE = "Bearer";