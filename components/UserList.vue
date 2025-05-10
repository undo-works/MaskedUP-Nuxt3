<template>
  <div class="wrapper">
    <main>
      <v-card class="overflow-auto">
        <ul>
          <li v-for="userInfo in $props.listProps" class="cell">
            <v-divider color="teal-darken-3" :thickness="4" class="mb-2" />
            <v-row class="mx-0">
              <!-- <h3>
                <NuxtLink :to="{ name: 'user-userId', params: { userId: userInfo.user_id } }">
                  <v-icon icon="mdi-account-circle-outline" size="x-large" />
                </NuxtLink>{{ userInfo.user_name }}
              </h3> -->
              <NuxtLink :to="{ name: 'user-userId', params: { userId: userInfo.user_id } }" class="ml-4 mt-2">
                <NuxtImg :src="userInfo.icon_image" class="iconImage"></NuxtImg>
              </NuxtLink>
              <v-col class="mt-2 ml-2">
                <NuxtLink :to="{ name: 'user-userId', params: { userId: userInfo.user_id } }" class="linkText">
                  <p>
                    <b>{{ userInfo.user_name }}</b>
                  </p>
                  <small>@{{ userInfo.user_id }}</small>
                </NuxtLink>
              </v-col>
              <v-btn v-if="data?.username !== undefined && userInfo.isFollowing === 1" class="ml-auto mr-4 my-4"
                @click="followFunc(userInfo)">Following
              </v-btn>
              <v-btn v-if="data?.username !== undefined && userInfo.isFollowing === 0" color="teal"
                class="ml-auto mr-4 my-4" @click="followFunc(userInfo)">Follow
              </v-btn>
            </v-row>
            <p class="introText">{{ userInfo?.introduce_ja }}</p>
          </li>
        </ul>
      </v-card>
    </main>
  </div>
</template>

<script lang="ts" setup>
import type { ResultResponse } from '~/types/common';
import type { UserSearchResponse } from '~/types/user';

/** ユーザ一覧用Props定義 */
interface Props {
  listProps: UserSearchResponse[] | null;
}
/** props変数 */
const props = defineProps<Props>();
/** 認証データ */
const { data } = await useAuth();

/**
 * フォロー/アンフォロー
 */
const followFunc = async (userInfo: UserSearchResponse) => {
  const result = await $fetch<ResultResponse>(USER_FOLLOW_URL, {
    body: {
      userId: userInfo.user_id,
      isRegister: userInfo.isFollowing == 0, // フォローしてなければ登録モード
    },
    method: "POST",
  });
  if (result.code === 0) {
    userInfo.isFollowing = userInfo.isFollowing == 1 ? 0 : 1;
  }
};
</script>

<style scoped lang="scss">
main {
  flex: 3;

  ul {
    list-style: none;
  }
}

.introText {
  min-height: 100px;
  margin-top: 8px;
  padding: 16px;
}

.cell {
  min-height: 200px;
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