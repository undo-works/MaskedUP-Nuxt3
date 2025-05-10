<template>
  <v-card class="mb-14">
    <PostBackArea title="back" />
    <v-responsive :aspect-ratio="4 / 1">
      <NuxtImg :src="userInfo.backImageUrl" format="webp" class="backImage" />
    </v-responsive>
    <v-row class="mx-0">
      <NuxtImg :src="userInfo.iconImageUrl" width="100" format="webp" class="iconImage" />

      <div v-if="data?.username !== undefined && userId !== userInfo.userId" class="my-2 ml-auto mr-8">
        <v-btn v-if="isFollowingData?.isFollowing === true" @click="followFunc()">Following
        </v-btn>
        <v-btn v-if="isFollowingData?.isFollowing === false" color="teal" @click="followFunc()">Follow
        </v-btn>
      </div>
    </v-row>
    <h4 class="ml-4 mt-4">{{ userInfo.userName }}</h4>
    <small class="ml-4">@{{ userInfo.userId }}</small>
    <p class="ml-4 mt-4">{{ userInfo.introduce }}</p>
    <v-row class="mx-4 my-4">
      <v-chip class="mx-2">following: {{ userInfo.followingNumber }}</v-chip>
      <v-chip class="mx-2">follower: {{ userInfo.followerNumber }}</v-chip>
    </v-row>

    <PostList v-bind:list-props="listData" :is-reply="false" />
  </v-card>
</template>

<script setup lang="ts">
import type { ResultResponse } from "~/types/common";
import type { PostListResponse } from "~/types/post";
import type { UserCheckFollowResponse, UserInfoResponse } from "~/types/user";
import { USER_CHECKFOLLOW_URL } from "~/utils/constants";

definePageMeta({ layout: "home-layout" });
const route = useRoute();
const userId = useCookie("username");
const { data } = await useAuth();

/** ユーザ情報 */
const userInfo = ref(initialUserInfo);
/** APIからのユーザ情報取得 */
const { status } = useAsyncData(
  `user/info/${route.params.userId}`,
  async () => {
    const result = await $fetch<UserInfoResponse>(USER_INFO_URL, {
      body: { userId: route.params.userId },
      method: "POST",
    });
    userInfo.value = result;
  },
);

/** フォロー中かチェック */
const { data: isFollowingData } = useAsyncData(
  `user/checkFollow/${route.params.userId}`,
  async () => {
    const result = await $fetch<UserCheckFollowResponse>(USER_CHECKFOLLOW_URL, {
      body: { userId: route.params.userId },
      method: "POST",
    });
    return result;
  },
  { server: false } // Cookieが必要なので画面から送る
);

/**
 * フォロー/アンフォロー
 */
const followFunc = async () => {
  const result = await $fetch<ResultResponse>(USER_FOLLOW_URL, {
    body: {
      userId: userInfo.value?.userId,
      isRegister: !isFollowingData.value?.isFollowing,
    },
    method: "POST",
  });
  if (result.code === 0 && isFollowingData.value) {
    isFollowingData.value.isFollowing = !isFollowingData.value.isFollowing;
  }
};

/** ユーザごとの投稿一覧データ */
const { status: listPending, data: listData } = useAsyncData(
  USER_POST_LIST_URL,
  async () => {
    const result = await $fetch<PostListResponse[]>(USER_POST_LIST_URL, {
      method: "POST",
      body: { userId: route.params.userId }
    });
    return result;
  },
  { server: false, }
);
</script>

<style lang="scss" scoped>
.iconImage {
  width: 112px;
  height: 112px;
  object-fit: cover;
  border-radius: 50%;
  margin-left: 24px;
  margin-top: -64px;
  border: 3px solid white;
  z-index: 2;
  background-color: white;
}

.backImage {
  width: 100%;
  margin-bottom: 16px;
  object-fit: cover;
  aspect-ratio: 1072 / 360;
}
</style>
