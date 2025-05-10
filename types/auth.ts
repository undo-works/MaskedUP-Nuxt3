export interface UserSubmitProps {
  userId: string;
  userName: string;
  password: string;
}

export interface UserLoginProps {
  username: string;
  password: string;
}

/**
 * トークン情報
 */
export interface SessionData {
  name: string;
  username: string;
  /** アイコン画像URL */
  picture: string;
}