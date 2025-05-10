<template>
  <v-carousel :show-arrows="imageList.length === 1 ? false : 'hover'" height="200px">
    <v-carousel-item v-for="imageUrl, index in imageUrlList" :src="imageUrl" cover
      @click.stop="changeOpen(true, imageUrlList, index)"></v-carousel-item>
  </v-carousel>

  <v-dialog v-model="isOpen" fullscreen>
    <v-icon @click="() => isOpen = false" color="teal-lighten-5" class="backArrow">mdi-arrow-left</v-icon>
    <v-carousel :show-arrows="false" hide-delimiters class="my-auto">
      <v-carousel-item v-for="imageUrl in imageList" :src="imageUrl"></v-carousel-item>
    </v-carousel>
  </v-dialog>
</template>

<script setup lang="ts">
/** 画像一覧用Props定義 */
interface Props {
  imageUrlList: string[];
}
// propsをtemplateから使えるように
defineProps<Props>();

const isOpen = useState<boolean>(() => false);
const imageList = useState<string[]>(() => []);
const changeOpen = (toOpen: boolean, imageUrlList: string[], index: number) => {

  // インデックスを使って配列を分割
  const firstPart = imageUrlList.slice(0, index); // 1番目からindex番目までの要素
  const secondPart = imageUrlList.slice(index); // index番目から最後までの要素

  // 配列を結合して返す
  imageList.value = secondPart.concat(firstPart);

  isOpen.value = toOpen;
}
</script>

<style lang="scss" scoped>
.backArrow {
  position: fixed;
  width: 60px;
  height: 60px;
  top: 16px;
  left: 16px;
  font-size: 48px;
}
</style>