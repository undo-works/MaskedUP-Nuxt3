<template>
  <v-sheet height="auto" class="pa-4">
    <v-form @submit.prevent="submit" v-model="valid">
      <div>
        <v-row class="my-1 align-center">
          <v-icon v-if="showCancel === true" size="x-large" @click="cancelFunc" class="ml-2">mdi-window-close</v-icon>
          <v-btn @click="openFileDialog" class="ml-auto mr-4" variant="tonal" color="teal-darken-1"><v-icon
              class="mr-2">mdi-image-multiple-outline</v-icon>IMAGE
            <input ref="fileInput" type="file" style="display: none" accept="image/*" @change="handleFileSelect"
              :multiple="true" />
          </v-btn>

          <v-speed-dial location="bottom center" transition="fade-transition">
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn v-bind="activatorProps" size="small" icon="mdi-cog" class="mr-4" color='white'></v-btn>
            </template>
            <v-btn key="1" @click="() => openMask = !openMask" icon="mdi-card-multiple-outline"
              :color="openMask ? 'blue-grey-darken-2' : 'white'"></v-btn>
          </v-speed-dial>
        </v-row>
        <v-textarea label="input your post" variant="solo-filled" clearable rows="7" v-model="postWord" class="mt-2"
          :rules="[rules.required, rules.maxText]"></v-textarea>
        <div class="overflow-x-auto d-flex mb-3">
          <img v-for="imageSrc in fileImageUrls" :src="imageSrc" height="200" class="mr-2" />
        </div>

        <div v-show="openMask" class="mb-6">
          <OtherPostDivider class="mt-2" />
          <v-row class="mt-4 ml-2">
            <h3>Mask the post engagement</h3>
            <v-icon @click="() => openMask = !openMask" class="ml-auto mr-4">mdi-window-close</v-icon>
          </v-row>
          <p class="ml-4 mt-4 text-caption">keep the number below 4294967295</p>
          <v-row class="mx-auto mt-2">
            <v-chip prepend-icon="mdi-repeat-variant" color="teal-accent-4" size="x-large" class="ml-4">
              <v-text-field v-model="maskRepost" :rules="[rules.maxCount]" type="number" variant="underlined"
                label="Repost" class="mt-2" single-line width="80"></v-text-field>
            </v-chip>
            <v-chip color="pink" prepend-icon="mdi-heart" size="x-large" class="ml-4">
              <v-text-field v-model="maskHeart" :rules="[rules.maxCount]" type="number" variant="underlined"
                label="Heart" class="mt-2" single-line width="80"></v-text-field>
            </v-chip>
          </v-row>
        </div>

        <v-alert v-if="showAlert" title="Post Error" color="error" icon="$error"
          text="Could not post. Please wait a while and post again."></v-alert>
        <v-btn block type="submit" :disabled="!valid" :loading="loading" color="teal" class="mt-2">Post</v-btn>
      </div>


    </v-form>
  </v-sheet>
</template>

<script lang="ts" setup>
import { type AxiosResponse } from 'axios';
import type { PostWriteResponse } from '~/types/post';
import request from '~/utils/defaultAxios';

/** 入力文字列 */
const postWord = useState<string>();
/** アイコン画像 */
const fileImages = useState<File[]>(() => []);
/** 画像仮URL */
const fileImageUrls = useState<string[]>(() => []);
/** アラートフラグ */
const showAlert = useState<boolean>();
/** ロード中フラグ */
const loading = useState<boolean>(() => false);
/** マスク開くかフラグ */
const openMask = useState<boolean>(() => false);
/** マスクいいね数 */
const maskHeart = useState<number | null>();
/** マスクリポスト数 */
const maskRepost = useState<number | null>();
/** バリデーション */
const valid = useState<boolean>();

/** 入力値のチェック用変数 */
const rules = {
  /** 必須入力チェック */
  required: (value: string) => !!value || 'required',
  /** 入力文字数 */
  maxText: (value: string) => value.length <= 2000 || 'Number of characters exceeds 2000',
  /** マスクの最大値 */
  maxCount: (value: number) => (value === undefined || value <= 4294967295) || 'keep'
}

/** 投稿送信 */
const submit = async () => {
  loading.value = true;
  showAlert.value = false;
  const formData = new FormData();
  formData.append("postBody", postWord.value ?? "");
  openMask && maskHeart.value && formData.append("maskHeart", maskHeart.value.toString());
  openMask && maskRepost.value && formData.append("maskRepost", maskRepost.value.toString());

  // 複数選択した画像を格納
  for (const file of fileImages.value) {
    const base64Image = await encodeFileToBase64(file);
    formData.append("imageList", base64Image);
  }

  const response: AxiosResponse<PostWriteResponse> = await request.post(POST_SEND_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).catch((error) => {
    loading.value = false;
    return error;
  });
  if (response.data.code === 0) {
    // 成功したらキャンセル処理　あるかわからんが
    postWord.value = "";
    fileImageUrls.value = [];
    fileImages.value = [];
    props.cancelFunc();
    // 成功したらタイムラインに追加
    const timeline = useTimelineState();
    timeline.value.unshift(response.data.postInfo);
    // 自分の投稿一覧にも追加
    const userPostList = useMyPostListState();
    userPostList.value.unshift(response.data.postInfo);
  } else {
    // 失敗したらアラートを表示
    showAlert.value = true;
  }
  loading.value = false;
}

/** ユーザ一覧用Props定義 */
interface Props {
  cancelFunc: () => void;
  showCancel: boolean;
}
// propsをtemplateから使えるように
const props = defineProps<Props>();

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
</script>

<style lang="scss" scoped>
.imageRow {
  display: flex;
  width: 360px;
  overflow-x: scroll;
  height: 120px;
}

.selectImage {
  height: 110px;
  object-fit: cover;
  flex-shrink: 0;
  margin-right: 8px;
}
</style>