import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient, SQS_QUEUE_URL } from "../config/sqs.js";
import logger from "../utils/logger.js";

//this is responsible for inserting the message inside the queue

export const publish = async (message) => {  //HERE MESSAGE CONTAINS THE { type , payload }
  if (!SQS_QUEUE_URL) {
    logger.warn("SQS_QUEUE_URL is not configured. Skipping notification publish.");
    return;
  }

  const command = new SendMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    MessageBody: JSON.stringify(message),   //converting JSON into JSON string
    MessageAttributes: {
      EventType: {
        DataType: "String",
        StringValue: message.type,
      },
    },
  });

  const result = await sqsClient.send(command);

  logger.info("SQS message published:", {
    type: message.type,
    messageId: result.MessageId,
  });

  return result;
};