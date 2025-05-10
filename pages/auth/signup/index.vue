<template>
  <div class="mainDiv">
    <img v-if="!$vuetify.display.xs" src="/LOGO.svg" />
    <div class="formDiv">
      <v-sheet class="mx-auto" width="300">
        <v-form :lazy-validation="true" ref="form" v-model="valid" @submit.prevent="submit">
          <img v-if="$vuetify.display.xs" src="/LOGO.svg" />
          <!-- ユーザ名 -->
          <v-text-field v-model="userName" :rules="[rules.required]" label="Your Name" class="my-1"></v-text-field>
          <!-- ユーザID -->
          <v-text-field v-model="userId" :rules="[rules.required, rules.deduplication]" label="Login ID"
            class="my-1"></v-text-field>
          <!-- パスワード -->
          <v-text-field :append-inner-icon="visible1 ? 'mdi-eye-off' : 'mdi-eye'" :type="visible1 ? 'text' : 'password'"
            v-model="password" :rules="[rules.required, rules.passwordCheck]" label="Password" class="my-1"
            @click:append-inner="visible1 = !visible1" />
          <!-- パスワード再入力 -->
          <v-text-field :append-inner-icon="visible2 ? 'mdi-eye-off' : 'mdi-eye'" :type="visible2 ? 'text' : 'password'"
            v-model="repassword" :rules="[rules.required, rules.samePassword]" label="Re-enter Password" class="my-1"
            @click:append-inner="visible2 = !visible2" />
          <v-alert v-if="showAlert" title="signup error" color="error" icon="$error"
            text="Sorry. Please sign up again with different data."></v-alert>
          <v-btn class="mt-2 text-none" type="submit" block color="teal" :disabled="!valid">Signup</v-btn>
          or <nuxt-link to="/auth/signin">Signin</nuxt-link>
        </v-form>
      </v-sheet>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResultResponse } from '~/types/common';

definePageMeta({ auth: false }); // 未ログインの状態でアクセスできる

/** ユーザID */
const userId = useState<string>();
/** ユーザ名 */
const userName = useState<string>();
/** パスワード */
const password = useState<string>();
/** パスワード再入力 */
const repassword = useState<string>();
/** パスワード表示チェック1 */
const visible1 = useState<boolean>();
/** パスワード表示チェック2 */
const visible2 = useState<boolean>();
/** バリデーション */
const valid = useState<boolean>();
/** アラートフラグ */
const showAlert = useState<boolean>();

/** 入力値のチェック用変数 */
const rules = {
  /** 必須入力チェック */
  required: (value: string) => !!value || 'required',
  /** ユーザIDの重複チェック */
  deduplication: async (value: string) => {
    const result = await $fetch<ResultResponse>(AUTH_DEDUPLICATION_URL, {
      method: "POST",
      body: { userId: userId.value }
    });
    return result.code !== 0 || 'Already used by another user';
  },
  /** パスワードの要件チェック */
  passwordCheck: (value: string) => {
    if (value.length < 8) {
      return false || 'Please set your password to at least 8 characters'; // 長さが足りない
    }
    const hasNumber = /\d/;
    const hasEnglish = /[a-zA-Z]/;
    if (!hasNumber.test(value) || !hasEnglish.test(value)) {
      return false || 'Please include alphanumeric characters in your password'; // 英語か数字のどちらかだけ
    }
    return true; // 要件に合致
  },
  /** パスワードの再入力が一致しているかチェック */
  samePassword: (value: string) => {
    return password.value === value || 'Passwords do not match'
  }
}

/** アカウント登録用関数 */
const submit = async () => {
  showAlert.value = false;
  const result = await $fetch<ResultResponse>(AUTH_SIGNUP_URL, {
    method: "POST",
    body: { userId: userId.value, userName: userName.value, password: password.value }
  });
  if (result.code === 0) {
    // 成功したら一度ログイン画面に遷移
    // externalをつけることでリダイレクト → useStateの初期値を設定
    const passState = usePasswordState();
    passState.value = password.value;
    navigateTo({ path: "/auth/signin", query: { userId: userId.value } });
  } else {
    // 失敗したらアラートを表示
    showAlert.value = true;
  }
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