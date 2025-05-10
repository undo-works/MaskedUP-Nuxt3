import type { SessionData } from "~/types/auth";
import type { PostListResponse } from "~/types/post";

/** タイムライン用ステート */
export const useTimelineState = () => {
  return useState<PostListResponse[]>("timeline", () => []);

  //   const pushTimeline = (post: PostListResponse) => {
  //     timeline.value.push(post);
  //   };
  //   return { timeline, pushTimeline };
};

/** 自分の投稿一覧用ステート */
export const useMyPostListState = () =>
  useState<PostListResponse[]>("mypostlist", () => []);

/** 投稿検索一覧用ステート */
export const usePostSearchState = (searchWord: string) =>
  useState<PostListResponse[]>(`searchword-${searchWord}`, () => []);

/** パスワードステート */
export const usePasswordState = () =>
  useState<string>(`password`, () => "");

/**
 * セッション管理用カスタムフック
 * @returns 
 */
export const useAuth = async () => {

  /**
   * サインイン処理
   * @param userId 
   * @param password 
   * @param callbackUrl
   */
  const signIn = async (username: string, password: string, callbackUrl?: string) => {
    const data = await $fetch<SessionData>("/api/auth/signin", {
      method: "POST",
      body: {
        username: username,
        password: password,
      },
    });
    callbackUrl && navigateTo(callbackUrl);
  }


  /**
   * セッション情報取得
   * @returns {SessionData} セッション情報
   */
  const data = await $fetch<SessionData>("/api/auth/user", {
    method: "POST",
  }).catch((error) => {
    console.log("you are not Not signed in.");
    return null;
  });

  /**
   * サインアウト処理
   */
  const signOut = (callbackUrl?: string) => {
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.split("=");
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    });

    const data = $fetch("/api/auth/signout", {
      method: "POST",
    });

    callbackUrl && navigateTo(callbackUrl);
  }

  /**
   * サインイン状態
   */
  const status = data ? true : false;

  return {
    signIn,
    data,
    signOut,
    status
  }
}