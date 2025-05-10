export interface ResultResponse {
  code: number;
}

/**
 * 0: 成功
 * 80: ユーザ情報なし
 * 81:　パスワード不一致
 */
export type ResultCode = 0 | 80 | 81;
