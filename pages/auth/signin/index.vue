<template>
  <div class="mainDiv">
    <img v-if="!$vuetify.display.xs" src="/LOGO.svg" />
    <v-sheet class="mx-auto my-auto" width="300">
      <v-form :lazy-validation="true" ref="form" v-model="valid" @submit.prevent="submit">
        <img v-if="$vuetify.display.xs" src="/LOGO.svg" />
        <v-alert v-if="route.query.userId !== undefined" title="Signup Successed" color="success" icon="$success"
          text="Let's sign in with your registered account" class="my-1"></v-alert>
        <!-- ユーザID -->
        <v-text-field v-model="userId" :rules="[rules.required]" label="Login ID" class="my-1" />
        <!-- パスワード -->
        <v-text-field :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'" :type="visible ? 'text' : 'password'"
          v-model="password" :rules="[rules.required]" label="Password" class="my-1"
          @click:append-inner="visible = !visible" />
        <v-alert v-if="showAlert" title="signin error" color="error" icon="$error"
          text="ユーザIDもしくはパスワードが異なります"></v-alert>
        <v-btn :disabled="!valid" class="mt-2" type="submit" block color="teal">Signin</v-btn>
        or <nuxt-link to="/auth/signup">Signup</nuxt-link>
      </v-form>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/' } }); // 未ログインの状態でアクセスできる

/** 現在のアクティブなルートに関する情報を取得 */
const route = useRoute();
/** ユーザID */
const userId = useState<string>(() => route.query.userId?.toString() || "");
/** パスワード */
const password = usePasswordState();
/** パスワード表示チェック */
const visible = useState<boolean>();
/** バリデーション */
const valid = useState<boolean>();
/** アラートフラグ */
const showAlert = useState<boolean>();

/** 入力値のチェック用変数 */
const rules = {
  /** 必須入力チェック */
  required: (value: string) => !!value || '必須入力です',
}
/** ログイン用関数 */
const submit = async () => {
  showAlert.value = false;
  const { signIn } = await useAuth();
  await signIn(userId.value, password.value, "/").catch(() => {
    showAlert.value = true;
  });
}
</script>

<style scoped lang="scss">
.mainDiv {
  display: grid;
  height: 100vh;
  grid-template-columns: 40vw 40vw;
  justify-content: center;
  /* 横方向は中央に */
  align-content: center;
  /* 縦方向は中央に */
}

img {}
</style>