<template>
  <v-container class="cont">
    <div class="wrapper">
      <aside v-if="!$vuetify.display.xs">
        <LeftBar />
      </aside>
      <main>
        <slot />
      </main>
      <BottomNav v-if="$vuetify.display.xs" />
    </div>

  </v-container>
</template>

<script setup lang="ts">
/** 横幅を知りたい */
const usevuetify = () => {
  const instance = getCurrentInstance()
  if (instance === null) {
    throw new Error(`vuetify instance doesn't exist`)
  } else {
    return instance.proxy?.$vuetify;
  }
}
const vuetify = usevuetify();

</script>

<style lang="scss" scoped>
.cont {
  padding: 0;
  max-width: 1080px;
}
.wrapper {
  display: flex;
}

aside {
  flex: 1.2;
}

main {
  flex: 3;
  max-width: 600px;

  ul {
    list-style: none;
  }
}
</style>