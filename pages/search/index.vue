<template>
  <v-card class="mb-14">
    <v-row class="mt-2 mx-0">
      <v-text-field v-model="searchWord" label="search" class="mx-4" />
    </v-row>
    <v-tabs v-model="tab" align-tabs="center" color="teal">
      <v-tab :value="1">post</v-tab>
      <v-tab :value="2">user</v-tab>
    </v-tabs>
    <v-window v-if="tab === 1">
      <v-window-item>
        <post-list v-bind:list-props="postListData" :is-reply="false" />
      </v-window-item>
    </v-window>
    <v-window v-if="tab === 2">
      <v-window-item>
        <user-list v-bind:list-props="userListData" />
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script lang="ts" setup>
import type { PostListResponse } from '~/types/post';
import type { UserSearchResponse } from '~/types/user';

definePageMeta({ layout: "home-layout" });

/** タブの操作 */
const tab = useState<number>();

/** 検索文字列 */
const searchWord = useState<string>();

/** APIからの投稿一覧取得 */
const { status, data: postListData } = useAsyncData(
  `${SEARCH_POST_LIST_URL}${searchWord}`,
  async () => {
    if (searchWord === undefined || tab.value !== 1) return [];
    const result = await $fetch<PostListResponse[]>(SEARCH_POST_LIST_URL, {
      body: { searchText: searchWord.value },
      method: "POST",
    });
    return result;
  },
  { server: false, watch: [searchWord, tab], }
);

/** APIからのユーザ一覧取得 */
const { status: userPending, data: userListData } = useAsyncData(
  `${SEARCH_USER_LIST_URL}${searchWord}`,
  async () => {
    if (searchWord === undefined || tab.value !== 2) return [];
    const result = await $fetch<UserSearchResponse[]>(SEARCH_USER_LIST_URL, {
      body: { searchText: searchWord.value },
      method: "POST",
    });
    return result;
  },
  { server: false, watch: [searchWord, tab], }
);
</script>

<style lang="scss"></style>