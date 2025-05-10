<template>
  <div class="wrapper">
    <main>
      <v-sheet>
        <ul>
          <li v-for="post in $props.listProps" @click="navigateDetail(post.id)" class="pb-2">
            <v-divider color="teal-darken-3" :thickness="4" class="mb-2" />
            <!-- <v-icon icon="mdi-account-circle-outline" size="x-large" @click="$router.push(`/user/${post.user_id}`)"></v-icon>            -->
            <p v-if="post.reposted_user_name !== null" class="text-teal-darken-2 font-italic text-center text-caption">
              {{ post.reposted_user_name }} reposted</p>
            <v-row class="mx-0">
              <NuxtLink :to="{ name: 'user-userId', params: { userId: post.user_id } }" class="ml-4 mt-2">
                <NuxtImg :src="post.icon_image" class="iconImage" width="60" height="60"></NuxtImg>
              </NuxtLink>
              <v-col class="mt-2 ml-2">
                <p>
                  <b>{{ post.user_name }}</b>
                </p>
                <small>@{{ post.user_id }}</small>
              </v-col>
            </v-row>

            <p class="postText">{{ post.body_ja }}</p>
            <v-sheet class="pa-4" v-if="post.image_url !== null">
              <OtherSampleImages v-if="post.image_url?.length !== 0" :image-url-list="post.image_url" />
            </v-sheet>

            <v-row v-if="data?.username !== undefined" class="pa-2 mx-2 pb-4 mt-4 justify-end">
              <v-chip v-show="isReply !== true && post.repost_id !== 0"
                @click.stop="registerRepost(post.id, post.repost_id === 0)" prepend-icon="mdi-repeat-variant"
                class="ml-auto mr-2" color="teal-accent-4">
                {{ post.repost_count }}
              </v-chip>
              <v-chip v-show="isReply !== true && post.repost_id === 0"
                @click.stop="registerRepost(post.id, post.repost_id === 0)" prepend-icon="mdi-repeat-variant"
                class="ml-auto mr-2">
                {{ post.repost_count }}
              </v-chip>
              <!-- 自分がいいねしたツイート -->
              <v-chip v-show="post.good_id !== 0" color="pink" prepend-icon="mdi-heart" class="mr-2"
                @click.stop="registerGood(post.id, post.good_id === 0)">
                {{ post.good_count }}
              </v-chip>
              <!-- いいねしてないツイート -->
              <v-chip v-show="post.good_id === 0" prepend-icon="mdi-heart" class="mr-2"
                @click.stop="registerGood(post.id, post.good_id === 0)">
                {{ post.good_count }}
              </v-chip>
            </v-row>

            <v-row v-if="data?.username === undefined" class="pa-2 mx-2 pb-4 mt-4 justify-end">
              <span v-if="isReply !== true" class="ml-auto mr-2 text-teal-accent-4">
                <v-icon color="teal-accent-4">mdi-repeat-variant</v-icon>
                {{ post.repost_count }}
              </span>
              <span class="ml-4 mr-2 text-pink">
                <v-icon color="pink">mdi-heart</v-icon>
                {{ post.good_count }}
              </span>
            </v-row>
          </li>
        </ul>
      </v-sheet>
    </main>
  </div>
</template>

<script lang="ts" setup>
import type { ResultResponse } from '~/types/common';
import type { PostListResponse } from '~/types/post';

/** 投稿一覧用Props定義 */
interface Props {
  listProps: PostListResponse[] | null;
  isReply: boolean | null;
}
/** props変数 */
const props = defineProps<Props>();

const { data } = await useAuth();

/**
 * いいねの登録
 * @param postId
 * @param isRegister
 */
const registerGood = async (postId: number, isRegister: boolean) => {
  const result = props.isReply === true ? await $fetch<ResultResponse>(REPLY_GOOD_URL, {
    body: { id: postId, isRegister: isRegister },
    method: "POST",
  }) : await $fetch<ResultResponse>(GOOD_URL, {
    body: { id: postId, isRegister: isRegister },
    method: "POST",
  });
  if (result.code === 0) {
    props.listProps?.forEach((post) => {
      if (post.id === postId && isRegister) {
        post.good_id = 100; // GOOD_IDあり → 自分がいいねした投稿
        post.good_count += 1;
      } else if (post.id === postId && !isRegister) {
        post.good_id = 0;
        post.good_count -= 1;
      }
      return post;
    });
  }
};

/**
 * リポストの登録
 * @param postId
 * @param isRegister
 */
const registerRepost = async (postId: number, isRegister: boolean) => {
  const result = await $fetch<ResultResponse>(REPOST_URL, {
    body: { id: postId, isRegister: isRegister },
    method: "POST",
  });
  if (result.code === 0) {
    props.listProps?.forEach((post) => {
      if (post.id === postId && isRegister) {
        post.repost_id = 100; // GOOD_IDあり → 自分がいいねした投稿
        post.repost_count += 1;
      } else if (post.id === postId && !isRegister) {
        post.repost_id = 0;
        post.repost_count -= 1;
      }
      return post;
    });
  }
};

/**
 * 詳細画面への遷移
 * @param postId 投稿テーブルID
 */
const navigateDetail = (postId: number) => {
  if (props.isReply !== true) {
    navigateTo({ name: 'post-postId', params: { postId: postId } });
  }
}
</script>

<style scoped lang="scss">
main {
  flex: 3;

  ul {
    list-style: none;
  }
}

.postText {
  margin-top: 16px;
  padding: 4px;
  margin-left: 12px;
  margin-right: 12px;
}

.iconImage {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-top: 4px;
}

.linkText {
  color: inherit;
  text-decoration: none;
}
</style>