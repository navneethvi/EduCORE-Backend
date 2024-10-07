import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "@envy-core/common";
import { configDotenv } from "dotenv";

configDotenv();

export const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY as string,
  },
});

export const getUploadSignedUrl = async (
  key: string,
  contentType: string
): Promise<string | null> => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    logger.info("Generated presigned URL for upload");
    return signedUrl;
  } catch (error) {
    logger.error("Error generating presigned URL for upload", { error });
    return null;
  }
};

export const getObjectUrl = async (key: string): Promise<string | null> => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    logger.info("Generated presigned URL for retrieval");
    return url;
  } catch (error) {
    logger.error("Error generating presigned URL for retrieval", { error });
    return null;
  }
};
