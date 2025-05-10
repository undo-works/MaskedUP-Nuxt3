<template>
  <div>
    <main v-if="listProps !== null">
      <!-- <v-icon icon="mdi-account-circle-outline" size="x-large" @click="$router.push(`/user/${post.user_id}`)"></v-icon>            -->
      <v-row class="mx-0">
        <NuxtLink :to="{ name: 'user-userId', params: { userId: listProps.user_id } }" class="ml-4 mt-2">
          <NuxtImg :src="listProps.icon_image" class="iconImage" width="60" height="60"></NuxtImg>
        </NuxtLink>
        <v-col class="mt-2 ml-2">
          <NuxtLink :to="{ name: 'user-userId', params: { userId: listProps.user_id } }" class="linkText">
            <p>
              <b>{{ listProps.user_name }}</b>
            </p>
            <small>@{{ listProps.user_id }}</small>
          </NuxtLink>
        </v-col>
      </v-row>

      <p class="postText">{{ listProps.body_ja }}</p>
      <v-sheet class="pa-4" v-if="listProps.image_url !== null">
        <OtherSampleImages v-if="listProps.image_url?.length !== 0" :image-url-list="listProps.image_url" />
      </v-sheet>

      <Transition name="slide-fade">
        <div v-if="isLoading === false && data?.username !== undefined" v-touch="{ move: () => maskPeel() }"
          class="d-flex flex-row justify-end text-black mt-4">
          <v-chip v-show="listProps.repost_id !== 0" @click.stop="registerRepost(listProps.repost_id === 0)"
            prepend-icon="mdi-repeat-variant" class="ml-auto mr-2" color="teal-accent-4">
            {{ listProps.repost_count }}
          </v-chip>
          <v-chip v-show="listProps.repost_id === 0" @click.stop="registerRepost(listProps.repost_id === 0)"
            prepend-icon="mdi-repeat-variant" class="ml-auto mr-2">
            {{ listProps.repost_count }}
          </v-chip>
          <!-- 自分がいいねしたツイート -->
          <v-chip v-show="listProps.good_id !== 0" color="pink" prepend-icon="mdi-heart" class="mr-4 mb-2 mr-2"
            @click="registerGood(listProps?.id, listProps?.good_id === 0)">
            {{ listProps.good_count }}
          </v-chip>
          <!-- いいねしてないツイート -->
          <v-chip v-show="listProps.good_id === 0" prepend-icon="mdi-heart" class="mr-4 mb-2 mr-2"
            @click="registerGood(listProps?.id, listProps?.good_id === 0)">
            {{ listProps.good_count }}
          </v-chip>
        </div>
      </Transition>



      <v-row v-show="data?.username === undefined" class="pa-2 mx-2 pb-4 mt-4 justify-end">
        <span class="ml-auto mr-2 text-teal-accent-4">
          <v-icon color="teal-accent-4">mdi-repeat-variant</v-icon>
          {{ listProps.repost_count }}
        </span>
        <span class="ml-4 mr-2 text-pink">
          <v-icon color="pink">mdi-heart</v-icon>
          {{ listProps.good_count }}
        </span>
      </v-row>

    </main>
  </div>
</template>

<script lang="ts" setup>
import type { PeelMaskResponse } from '~/types/action';
import type { ResultResponse } from '~/types/common';
import type { PostListResponse } from '~/types/post';

/** 投稿一覧用Props定義 */
interface Props {
  listProps: PostListResponse;
}
/** props変数 */
const props = defineProps<Props>();

/** 認証データ */
const { data } = await useAuth();
/** マスクローディング */
const isLoading = ref(false);

/**
 * いいねの登録
 * @param postId
 * @param isRegister
 */
const registerGood = async (postId: number | undefined, isRegister: boolean | undefined) => {
  const result = await $fetch<ResultResponse>(GOOD_URL, {
    body: { id: postId, isRegister: isRegister },
    method: "POST",
  });
  if (result.code === 0 && props.listProps !== null) {
    if (props.listProps?.id === postId && isRegister) {
      props.listProps.good_id = 100; // GOOD_IDあり → 自分がいいねした投稿
      props.listProps.good_count += 1;
    } else if (props.listProps.id === postId && !isRegister) {
      props.listProps.good_id = 0;
      props.listProps.good_count -= 1;
    }
  }
};

/**
 * リポストの登録
 * @param postId
 * @param isRegister
 */
const registerRepost = async (isRegister: boolean) => {
  const result = await $fetch<ResultResponse>(REPOST_URL, {
    body: { id: props.listProps.id, isRegister: isRegister },
    method: "POST",
  });
  if (result.code === 0) {
    if (isRegister) {
      props.listProps.repost_id = 100; // GOOD_IDあり → 自分がいいねした投稿
      props.listProps.repost_count += 1;
    } else if (!isRegister) {
      props.listProps.repost_id = 0;
      props.listProps.repost_count -= 1;
    }
  };
};

/** マスクをはがす  */
const maskPeel = async () => {
  isLoading.value = true;
  const result = await $fetch<PeelMaskResponse>(PEEL_MASK_URL, {
    body: { id: props.listProps.id, },
    method: "POST",
  });
  props.listProps.good_count = result.goodCount;
  props.listProps.repost_count = result.repostCount;
  isLoading.value = false;
}
</script>

<style scoped lang="scss">
.postText {
  min-height: 50px;
  margin-top: 16px;
  padding: 4px;
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

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  // transform: translateX(-20px);
  opacity: 0;
}
</style>