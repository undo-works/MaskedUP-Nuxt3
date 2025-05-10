<template>
  <v-card class="mb-16">
    <PostBackArea title="back" />
    <PostDetail v-if="asyncData != null" :list-props="asyncData" />

    <v-divider class="my-2" />

    <v-form @submit.prevent="submit" v-model="valid">
      <v-textarea :rules="[rules.required, rules.maxText]" label="input your reply" variant="solo-filled" clearable
        rows="2" v-model="postWord"></v-textarea>
      <div class="overflow-x-auto d-flex w-100">
        <img v-for="imageSrc in fileImageUrls" :src="imageSrc" height="200" class="mr-2 mb-6" />
      </div>
      <v-alert v-if="showAlert" title="Post Error" color="error" icon="$error"
        text="投稿できませんでした。時間をおいてから再度投稿してください。"></v-alert>
      <v-row class="mx-0">
        <v-btn @click="openFileDialog" variant="tonal"
          color="teal-darken-1"><v-icon>mdi-image-multiple-outline</v-icon>IMAGE
          <input ref="fileInput" type="file" style="display: none" accept="image/*" @change="handleFileSelect"
            :multiple="true" />
        </v-btn>
        <v-btn type="submit" color="teal" class="ml-auto" :loading="loading" :disabled="!valid">reply</v-btn>
      </v-row>
    </v-form>

    <v-divider class="mt-4" />

    <PostList v-if="replyData !== null" :list-props="replyData" :is-reply="true" />
    <!-- <v-progress-circular v-if="replyPending === true" indeterminate :size="96" :width="7" /> -->
  </v-card>
</template>

<script lang="ts" setup>
import type { AxiosResponse } from 'axios';
import type { ResultResponse } from '~/types/common';
import type { PostListResponse, PostWriteResponse } from '~/types/post';
import request from '~/utils/defaultAxios';
const route = useRoute();
const nuxtApp = useNuxtApp()

definePageMeta({ layout: "home-layout" });

/** バリデーション */
const valid = useState<boolean>();

/** 入力値のチェック用変数 */
const rules = {
  /** 必須入力チェック */
  required: (value: string) => !!value || 'required',
  /** 入力文字数 */
  maxText: (value: string) => value.length <= 255 || 'Number of characters exceeds 255',
}

/** APIからの投稿取得 */
const { data: asyncData } = await useFetch<PostListResponse>(POST_INFO_URL, {
  method: "POST",
  body: { postTableId: route.params.postId },
  key: `${POST_INFO_URL}${route.params.postId}`,
  getCachedData: (key) => nuxtApp.payload.data[key] || nuxtApp.static.data[key]
});

/** 入力文字列 */
const postWord = useState<string>();
/** アイコン画像 */
const fileImages = useState<File[]>(() => []);
/** 画像仮URL */
const fileImageUrls = useState<string[]>(() => []);
/** アラートフラグ */
const showAlert = useState<boolean>();
/** ロード中 */
const loading = useState<boolean>(() => false);

/** 投稿送信 */
const submit = async () => {
  loading.value = true;
  showAlert.value = false;
  const formData = new FormData();
  formData.append("replyBody", postWord.value ?? "");
  formData.append("postTableId", route.params.postId.toString() ?? "");
  fileImages.value.map((fileData) => {
    formData.append("imageList", fileData);
  })
  const response: AxiosResponse<PostWriteResponse> = await request.post(REPLY_SEND_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  if (response.data.code === 0) {
    // 成功したらリロード
    replyData.value?.unshift(response.data.postInfo);
  } else {
    // 失敗したらアラートを表示
    showAlert.value = true;
  }
  loading.value = false;
}

const fileInput = ref<HTMLInputElement | null>(null);
const openFileDialog = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};
/** ファイル選択関数 */
const handleFileSelect = (event: Event) => {
  // 画像情報のセット
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);
  if (files.length > 4) files.length = 4;
  fileImages.value = files;
  // 仮URLのリセットとセット
  fileImageUrls.value = [];
  files.map((file) => {
    fileImageUrls.value.push(URL.createObjectURL(file));
  })
};


/** APIからのリプライ一覧取得 */
const { data: replyData } = await useFetch<PostListResponse[]>(REPLY_LIST_URL, {
  method: "POST",
  body: { postTableId: route.params.postId },
  key: `${REPLY_LIST_URL}${route.params.postId}`,
  getCachedData: (key) => nuxtApp.payload.data[key] || nuxtApp.static.data[key]
});
</script>

<style lang="scss" scoped>
form {
  padding: 8px;
  max-width: 100vw;
}
</style>