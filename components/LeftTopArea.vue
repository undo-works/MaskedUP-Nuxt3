<template>
  <div class="topDiv">
    <img src="/LOGO.svg" />
    <p>{{ status }}</p>
  </div>
</template>

<script setup lang="ts">
const { status } = await useAuth();
</script>

<style lang="scss" scoped>
.topDiv {
  img {
    width: 200px
  }
}
</style>