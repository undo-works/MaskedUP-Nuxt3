<template>
  <v-card class="mb-14">
    <div v-if="userInfo !== undefined && userInfo !== null">
      <v-responsive :aspect-ratio="4 / 1">
        <NuxtImg :src="userInfo?.backImageUrl ?? '/long_no_image.svg'" class="backImage" />
      </v-responsive>
      <v-row class="mx-0">
        <NuxtImg :src="userInfo?.iconImageUrl ?? '/no_icon.svg'" width="100" format="webp" class="iconImage" />

        <v-btn class="my-2 ml-auto mr-8" @click="editNavigate" color="blue-grey-darken-2"
          style="text-transform: none">Edit
          Profile
        </v-btn>
      </v-row>
      <h3 class="ml-8 mt-4">{{ userInfo?.userName }}</h3>
      <p class="ml-8 text-subtitle-2">@{{ userInfo?.userId }}</p>
      <p class="ml-8 mt-4">{{ userInfo?.introduce }}</p>
      <v-row class="mx-4 my-4">
        <v-chip class="mx-2">following: {{ userInfo?.followingNumber }}</v-chip>
        <v-chip class="mx-2">follower: {{ userInfo?.followerNumber }}</v-chip>
      </v-row>
    </div>
    <PostList v-bind:list-props="userPost" :is-reply="false" />
  </v-card>
</template>

<script setup lang="ts">
import type { PostListResponse } from "~/types/post";
import type { UserInfoResponse } from "~/types/user";

definePageMeta({ layout: "home-layout" });

const userId = useCookie("username");
const nuxtApp = useNuxtApp()

/** APIからのユーザ情報取得 */
const { data: userInfo, error: meerror } = await useFetch<UserInfoResponse>(USER_ME_URL, {
  method: "POST",
  body: { userId: userId.value },
  key: `${USER_ME_URL}`,
  getCachedData: (key) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
});

/** ユーザごとの投稿一覧データ */
const { data: listData, error } = await useFetch<PostListResponse[]>(USER_POST_LIST_URL, {
  method: "POST",
  body: { userId: userId.value },
  key: `${USER_POST_LIST_URL}`,
  getCachedData: (key) => nuxtApp.payload.data[key] || nuxtApp.static.data[key]
});
const userPost = useMyPostListState();
watchEffect((): void => { userPost.value = listData.value ?? [] });

/** 編集画面への遷移 */
const editNavigate = () => {
  navigateTo("/user/edit");
}
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
