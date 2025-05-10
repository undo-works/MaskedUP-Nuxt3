/**
 * MIMEタイプを取得する
 * @param base64String - Base64エンコードされた画像データ
 * @returns 
 */
export const decodedBase64ImageMimeType = (base64String: string) => {
  // 例: data:image/png;base64,xxxxxx
  const match = base64String.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
  return match ? match[1] : null;
}

/**
 * Base64エンコードされた画像データをデコードする
 * @param base64String - Base64エンコードされた画像データ
 * @returns - デコードされたバッファ
 */
export const decodeBase64Image = (base64String: string) => {
  // 例: data:image/png;base64,xxxxxx
  const base64 = base64String.split(',')[1];
  return base64 || null;
}