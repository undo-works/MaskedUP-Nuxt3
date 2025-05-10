<template>
  <v-bottom-navigation>
    <v-btn value="home" class="px-0">
      <NuxtLink to="/"><v-icon color="teal">mdi-home</v-icon></NuxtLink>
      <span>home</span>
    </v-btn>

    <v-btn value="search" class="px-0">
      <NuxtLink to="/search"><v-icon color="teal">mdi-magnify</v-icon></NuxtLink>
      <span>search</span>
    </v-btn>

    <v-btn v-if="data?.username !== undefined" fab large color="teal" @click="changeIsOpen" class="px-0">
      <v-icon color="teal">mdi-plus-circle</v-icon>
      <span>post</span>
    </v-btn>

    <v-btn v-if="data?.username !== undefined" @click="signOut()" class="px-0">
      <v-icon color="teal">mdi-logout</v-icon>
      <span>logout</span>
    </v-btn>

    <v-btn v-else-if="data?.username === undefined" @click="navigateTo('/auth/signin')" class="px-0">
      <v-icon color="teal">mdi-login</v-icon>
      <span>login</span>
    </v-btn>

    <v-btn v-if="data?.username !== undefined" value="me" class="px-0">
      <NuxtLink to="/user/me">
        <NuxtImg v-if="data?.picture !== null" :src="data?.picture ?? '/no_icon.svg'" class="iconImage" width="24"
          height="24" />
        <v-icon v-if="data?.picture === null" color="teal">mdi-account-circle-outline</v-icon>
      </NuxtLink>
      <span>{{ data?.username }}</span>
    </v-btn>
  </v-bottom-navigation>

  <v-dialog max-width="500" v-model="isOpen">
    <PostInput :cancel-func="() => isOpen = false" :show-cancel="true" />
  </v-dialog>
</template>

<script lang="ts" setup>
/** ダイアログ */
const isOpen = useState<boolean | undefined>();

/** ダイアログ状態変更 */
const changeIsOpen = () => {
  isOpen.value = !isOpen.value;
}

/** 認証フック */
const { signOut, data } = await useAuth();
</script>

<style lang="scss" scoped>
.iconImage {
  object-fit: cover;
  border-radius: 50%;
}
</style>