<template>
  <v-container class="wrapContainer">
    <img src="/LOGO.svg" />
    <v-card elevation="2" class="my-2">
      <v-hover v-if="data?.username !== undefined" v-slot="{ isHovering, props }">
        <v-sheet @click="navigateTo('/user/me')" v-bind="props" :color="isHovering ? 'teal' : undefined">
          <v-row class="py-8 mx-2">
            <NuxtImg :src="data?.picture ?? NO_ICON_IMAGE" class="iconImage" width="80" height="80" />
            <!-- <v-icon v-if="!data || data.picture === null">mdi-account-circle-outline</v-icon> -->
            <v-col class="my-2">
              <h4>{{ data?.name }}</h4>
              <p>@{{ data?.username }}</p>
            </v-col>
          </v-row>
        </v-sheet>
      </v-hover>

      <v-sheet v-if="data?.username === undefined">
        <v-row class="py-8 mx-2">
          <NuxtImg :src="data?.picture ?? NO_ICON_IMAGE" class="iconImage" width="80" height="80" />
          <h4 class="my-auto ml-4">Guest Mode</h4>
        </v-row>
      </v-sheet>
      <v-divider color="teal-darken-3" :thickness="2" class="mx-2" />

      <v-hover v-slot="{ isHovering, props }">
        <v-sheet block @click="navigateTo('/')" nuxt class="rounded-0" v-bind="props"
          :color="isHovering ? 'teal' : undefined">
          <v-icon icon="mdi-list-box-outline" size="x-large" class="my-4 mx-2"></v-icon>
          Timeline
        </v-sheet>
      </v-hover>

      <v-divider color="teal-darken-3" :thickness="2" class="mx-2" />

      <!-- <PostInput :cancel-func="() => { }" :show-cancel="false" class="rounded-0" /> -->
      <v-hover v-slot="{ isHovering, props }">
        <v-sheet block @click="navigateTo('/search')" nuxt class="rounded-0" v-bind="props"
          :color="isHovering ? 'teal' : undefined">
          <v-icon icon="mdi-magnify" size="x-large" class="my-4 mx-2"></v-icon>
          Search
        </v-sheet>
      </v-hover>

      <v-divider color="teal-darken-3" :thickness="2" class="mx-2" />

      <v-hover v-slot="{ isHovering, props }">
        <v-sheet v-if="data?.username !== undefined" block @click="signOut('/auth/signin')" class="rounded-0"
          v-bind="props" :color="isHovering ? 'teal' : undefined">
          <v-icon icon="mdi-logout" size="x-large" class="my-4 mx-2"></v-icon>
          Signout
        </v-sheet>
        <v-sheet v-if="data?.username === undefined" block @click="navigateTo('/auth/signin', { external: true })"
          class="rounded-0" v-bind="props" :color="isHovering ? 'teal' : undefined">
          <v-icon icon="mdi-login" size="x-large" class="my-4 mx-2"></v-icon>
          SignIn
        </v-sheet>
      </v-hover>

    </v-card>

    <v-btn :disabled="data?.username === undefined" @click="changeIsOpen" rounded="xl" size="x-large" block
      class="py-8 mt-8" color="teal">
      <v-icon icon="mdi-plus-circle-outline" size="x-large" class="my-4 mx-2"></v-icon>
      New Post
    </v-btn>

    <v-dialog max-width="500" v-model="isOpen">
      <PostInput :cancel-func="() => isOpen = false" :show-cancel="true" />
    </v-dialog>
  </v-container>

</template>

<script setup lang="ts">


const name = useCookie('name');

const { signOut, data } = await useAuth();

</script>
<script lang="ts">
import axios from 'axios';
export default {
  data: vm => ({
    loading: false,
    rules: [],
    timeout: null,
    body: '',
    auth: useAuth(),
    isOpen: false
  }),
  methods: {
    async submit(_event: any) {
      this.loading = true;
      const result = await axios.post("/api/post/write", { "body": this.body });
      this.loading = false
    },
    changeIsOpen() {
      this.isOpen = !this.isOpen;
    }
  }
}
</script>

<style scoped lang="scss">
.wrapContainer {
  max-width: 300px;
  position: fixed;
}

.iconImage {
  object-fit: cover;
  border-radius: 50%;
  // margin: 16px 8px 16px 8px;
}
</style>