<template>
  <main>
    <v-card class="py-2 px-2">
      <v-form :lazy-validation="true" ref="form" v-model="valid" @submit.prevent="submit">
        <v-responsive :aspect-ratio="4 / 1">
          <NuxtImg @click="openBackFileDialog" :src="userInfo.backImageUrl" class="backImage" />
          <input ref="backFileInput" type="file" style="display: none" accept="image/*" @change="handleBackFileSelect"
            :multiple="false" />
        </v-responsive>
        <v-row>
          <v-btn @click="openFileDialog" icon="mdi-account-circle-outline" size="x-large" class="ml-4">
            <input ref="fileInput" type="file" style="display: none" accept="image/*" @change="handleFileSelect"
              :multiple="false" />
            <NuxtImg :src="userInfo.iconImageUrl" width="100" format="webp" class="iconImage" />
          </v-btn>
          <v-responsive max-width="400" class="mx-4 my-1">
            <v-text-field v-model="userInfo.userName" :rules="[]" label="ユーザ名" />
          </v-responsive>
        </v-row>
        <v-textarea v-model="userInfo.introduce" />

        <v-row class="d-flex flex-row justify-end text-black">
          <v-btn class="mx-2" @click="cancelNavigate" color="blue-grey-lighten-5">キャンセル
          </v-btn>
          <v-btn class="mx-2" @click="submit" color="blue-grey-darken-2">登録
          </v-btn>
        </v-row>
      </v-form>
      <v-card-text class="introText">

      </v-card-text>
    </v-card>
  </main>
</template>

<script setup lang="ts">
import type { AxiosResponse } from "axios";
import axios from "axios";
import type { ResultResponse } from "~/types/common";
import type { UserInfoResponse } from "~/types/user";
import request from "~/utils/defaultAxios";

definePageMeta({ layout: "home-layout" });

const userId = useCookie("username");

/** アラートフラグ */
const showAlert = useState<boolean>();
/** バリデーション */
const valid = useState<boolean>();
/** アイコン画像 */
const iconImage = useState<File | undefined>();
/** アイコン画像 */
const backImage = useState<File | undefined>();
/** ユーザ情報 */
const userInfo = useState<UserInfoResponse>(() => initialUserInfo);

/** APIからのユーザ情報取得 */
useLazyAsyncData(
  USER_INFO_URL,
  async () => {
    const result = await $fetch<UserInfoResponse>(USER_ME_URL, {
      body: { userId: userId.value },
      method: "POST",
    });
    userInfo.value = result;
  },
  { server: false, }
);


/** アカウント登録用関数 */
const submit = async () => {
  showAlert.value = false;
  const formData = new FormData();
  formData.append("userId", userId.value ?? "");
  formData.append("userName", userInfo.value.userName ?? "");
  formData.append("introduce", userInfo.value?.introduce ?? "");

  if (iconImage.value) {
    // 画像をbase64に変換して格納
    const base64Image = await encodeFileToBase64(iconImage.value);
    formData.append("iconImage", base64Image);
  }

  if (backImage.value) {
    // 画像をbase64に変換して格納
    const base64Image = await encodeFileToBase64(backImage.value);
    formData.append("backImage", base64Image);
  }

  const result: AxiosResponse<ResultResponse> = await request.post(AUTH_CHANGE_PROFILE_URL, formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
  });
  if (result.data.code === 0) {
    // 成功したらプロフィール画面に戻る
    navigateTo("/user/me", { external: true });
  } else {
    // 失敗したらアラートを表示
    showAlert.value = true;
  }
}
/** キャンセルボタンで戻す処理 */
const cancelNavigate = () => {
  const router = useRouter();
  router.go(-1);
}

const fileInput = ref<HTMLInputElement | null>(null);
const openFileDialog = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};
/** ファイル選択関数 */
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    // イメージデータとURLを指定
    iconImage.value = input.files?.[0];
    userInfo.value.iconImageUrl = URL.createObjectURL(input.files?.[0]);
  }
};

const backFileInput = ref<HTMLInputElement | null>(null);
const openBackFileDialog = () => {
  if (backFileInput.value) {
    backFileInput.value.click();
  }
};
/** 背景画像選択関数 */
const handleBackFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    // イメージデータとURLを指定
    backImage.value = input.files?.[0];
    userInfo.value.backImageUrl = URL.createObjectURL(input.files?.[0]);
  }
};
</script>

<style lang="scss" scoped>
.iconImage {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
}

.backImage {
  width: 100%;
  margin-bottom: 16px;
  object-fit: cover;
  aspect-ratio: 1072 / 360;
}

.top-row {}

.introText {}
</style>