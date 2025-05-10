/**
 * サニタイジング処理
 * @param text 無害化したいテキスト
 * @returns 無害化後のテキスト
 */
export const sanitizingFunc = (text: string) => {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};
