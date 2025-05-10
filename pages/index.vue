<template>
  <v-card class="mb-14">
    <p class="text-center font-italic pa-4 text-blue-grey-darken-4 bg-teal-lighten-4"><b>Your Timeline</b></p>
    <PostList v-bind:list-props="timeline ?? []" :is-reply="false"></PostList>
    <div v-if="timeline === null || timeline.length === 0" class="text-teal-lighten-3 pa-8">
      <h2 class="mb-2"><b>There is no timeline.</b></h2>
      <h4>When you follow a user, posts from the user you follow within the past week will be displayed as a timeline.
      </h4>
    </div>
    <OtherPostDivider />
    <p class="text-center font-italic pa-4 text-blue-grey-darken-4 bg-teal-lighten-4"><b>recommend posts for you!</b>
    </p>
    <div v-if="recommendList === null || recommendList?.postList.length === 0" class="text-teal-lighten-3 pa-8">
      <h2 class="mb-2"><b>There are no recommended posts.</b></h2>
      <h4>Search with your favorite word and </h4>
      <h4>Click the "heart" button on the post that interests you.</h4>
    </div>
    <PostList v-bind:list-props="recommendList?.postList ?? []" :is-reply="false"></PostList>
  </v-card>
</template>

<script setup lang="ts">
definePageMeta({ layout: "home-layout" });
const nuxtApp = useNuxtApp();

const { data: authData } = await useAuth();

/** APIからの投稿一覧取得 */
const { data: timelinePosts } = await useFetch<PostListResponse[]>(POST_LIST_URL, {
  method: "POST",
  key: `${POST_LIST_URL}`,
  getCachedData: (key) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
  immediate: authData !== undefined,
  server: authData !== undefined
});
/** タイムライン用ステート */
const timeline = useTimelineState();
watchEffect((): void => { timeline.value = timelinePosts.value ?? [] });

/** おすすめの投稿一覧取得 */
const { data: recommendList } = await useFetch<RecommendPostResponse>(RECOMMEND_POST_LIST_URL, {
  method: "POST",
  key: `${RECOMMEND_POST_LIST_URL}`,
  getCachedData: (key) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
  immediate: authData !== undefined,
  server: authData !== undefined,
});
</script>

<script lang="ts">
import axios from "axios";
import type { PostListResponse } from "~/types/post";
import type { RecommendPostResponse } from "~/types/recommend";
export default {
  data: (vm) => ({
    loading: false,
    rules: [],
    timeout: null,
    body: "",
    auth: useAuth(),
  }),
  methods: {
    async submit(_event: any) {
      this.loading = true;
      const result = await axios.post("/api/post/write", { body: this.body });
      this.loading = false;
    },
  },
};
</script>
