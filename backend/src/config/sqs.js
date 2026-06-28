import { SQSClient } from "@aws-sdk/client-sqs";

export const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;

export const SQS_WAIT_TIME_SECONDS =
  Number.parseInt(process.env.SQS_WAIT_TIME_SECONDS, 10) || 20;

export const SQS_MAX_MESSAGES =
  Number.parseInt(process.env.SQS_MAX_MESSAGES, 10) || 10;