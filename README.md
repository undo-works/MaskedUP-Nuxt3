# デプロイ方法

````bash
# ビルド
# ビルドコマンド内にprisma generateも含まれてる
npm run build

# デプロイ
sam deploy
````

# AWS SSM

VPCのセキュリティグループに
インバウンド：：https：：10.0.0.0/16を追加した

## 参考

https://qiita.com/nkserveren26/items/b67bb7bb69626271cdcd

# 認証周りの解説

https://reffect.co.jp/nuxt/sidebase-nuxt-auth#useAuth_Composable

# nuxt-authのリフレッシュトークンサンプル

https://github.com/sidebase/nuxt-auth/blob/main/playground-refresh/nuxt.config.ts

# useCookiesの使い方

https://nuxt.com/docs/api/composables/use-cookie

# prisma関連で使うコマンド

````bash
# データベースからテーブル構成取得
npx prisma db pull 

# 取得した構成を反映?
npx prisma generate
````

# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

# prismaの導入

https://zenn.dev/kote2/articles/cec55a155fbae1

クエリ基礎
https://www.prisma.io/docs/orm/prisma-client/queries/crud

# もろもろの環境構築

https://qiita.com/rockinruuula1227/items/efc54e5f43911b336f3d

# フォーマッタ

https://qiita.com/yuki_s_14/items/96620ccfb1dd897ce9f3

Shift + Alt + F でフォーマットできる

# Sharp

NuxtImgで変形・縮小させて画像を取得するとき、以下のコマンド打てと言われた。
Ubuntuで実施するために必要なのか・・・？？

````bash
npm install --platform=linux --arch=x64 sharp
````

# CloudFront通すとファイルアップロードできねーって時

https://zenn.dev/ttskch/scraps/e37a50f2a2d8bf


# デプロイ

1 ドメイン取得
2 AWS SSLを作成
3 cloudfrontに登録
4 53でCNAMEレコード作成(CloudFrontから遷移できるやつ)
5 53のAレコードをailias→CloudFront→登録したURLにする
6 CloudFrontのキャッシュ削除

# 余裕があるとき見よう
Nuxt3でポートフォリオサイトを構築するときに使ったTips
https://zenn.dev/kote2/articles/dcf2c0a8cd90f8

本当は認証こっちのほうがいいのかも・・・
https://qiita.com/tomoeine/items/91163ec5a674d697bc75

# 開発メモ

結果コード
0: 成功
60: ソルト作成失敗
61: パスワードハッシュ化失敗
62: すでに希望するuserIdは登録済み
63: ユーザ情報なし
64: 必須要素なし
90: DBエラー
91: S3関連エラー 
92: リクエスト情報のエンコード失敗

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
