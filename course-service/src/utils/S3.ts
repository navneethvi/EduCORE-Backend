import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { configDotenv } from "dotenv";

configDotenv();

export const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY as string,
  },
});

export const putObject = async (
  key: string,
  contentType: string,
  body: Buffer | Uint8Array | Blob | string
): Promise<boolean> => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      Body: body,
    });

    await s3Client.send(command);
    console.log("File uploaded successfully.");
    return true;
  } catch (error) {
    console.error("Error uploading file:", error);
    return false;
  }
};

export const getObjectUrl = async (key: string): Promise<string | null> => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log("Generated presigned URL for retrieval:", url);
    return url;
  } catch (error) {
    console.error("Error generating presigned URL for retrieval:", error);
    return null;
  }
};
