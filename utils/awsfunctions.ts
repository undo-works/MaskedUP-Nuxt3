import AWS from "aws-sdk";

// IAMロールのアクセスキーとシークレットキーを設定
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_PRIVATE_KEY,
  region: process.env.S3_REGION, // 例: 'us-west-2'
});

// S3クライアントを作成
const s3 = new AWS.S3();

// 画像をアップロードする関数
export const uploadImageToS3 = async (
  key: string,
  file: Buffer,
  contentType: string
) => {
  try {
    // SSMからバケット名を取得
    const bucketName = await getSsmParameter("/MASKEDUP/S3_BUCKET_NAME");
    const params: AWS.S3.PutObjectRequest = {
      Bucket: bucketName ?? "",
      Key: "botor/" + key,
      Body: file,
      ContentType: contentType, // 画像のMIMEタイプに合わせて設定
    };

    const result = await s3.upload(params).promise();
    console.log("Uploaded successfully:", result.Location);
    return result.Location;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/**
 * SSMのイニシャライズ
 */
const ssm = new AWS.SSM();

/**
 * SSMパラメータから環境変数を取得
 * @param parameterName - パラメタ名
 * @returns The value of the parameter as a string.
 */
export const getSsmParameter = async (parameterName: "/MASKEDUP/S3_BUCKET_BASE_URL" | "/MASKEDUP/S3_BUCKET_NAME" | "/MASKEDUP/ACCESS_TOKEN_SECRET"): Promise<string> => {
  try {
    const result = await ssm
      .getParameter({
        Name: parameterName,
        WithDecryption: true,
      })
      .promise();

    if (!result.Parameter || !result.Parameter.Value) {
      throw new Error(
        `Parameter ${parameterName} not found or has no value.`
      );
    }

    return result.Parameter.Value ?? "";
  } catch (error) {
    console.error(`Error retrieving parameter ${parameterName}:`, error);
    throw error;
  }
}