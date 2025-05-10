<template>
  <div class="backArea">
    <v-icon @click="backFunc" size="x-large">mdi-arrow-left</v-icon>
    <b class="px-4">{{ title }}</b>
  </div>
</template>

<script lang="ts" setup>

/** 戻り先の文字列定義 */
interface Props {
  title: string;
}
/** props変数 */
defineProps<Props>();

const backFunc = () => {
  const router = useRouter();
  router.go(-1);
}
</script>

<style>
.backArea {
  width: 100%;
  height: 40px;
  padding: 4px;
  background-color: rgba(255, 255, 255, 0.7);
  top: 0;
  left: 0;
  position: sticky;
  z-index: 1;
}
</style>