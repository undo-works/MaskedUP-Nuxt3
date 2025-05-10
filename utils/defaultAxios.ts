import axios from "axios";

// Axiosのグローバルオプションを設定するためのインスタンスを作成
const request = axios.create({
  baseURL: "/",
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json", // デフォルトのContent-Typeを設定
  },
  timeout: 30 * 1000,
});

export default request;
