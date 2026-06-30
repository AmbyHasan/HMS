import {ReceiveMessageCommand, DeleteMessageCommand,} from "@aws-sdk/client-sqs";
import {sqsClient, SQS_QUEUE_URL, SQS_WAIT_TIME_SECONDS, SQS_MAX_MESSAGES } from "../config/sqs.js";
import processNotification from "./email-service.js";
import logger from "../utils/logger.js";

//THIS IS RESPONSIBLE FOR POLLING CONTINOUSLY

//variables for controlling the worker
let isRunning = false;
let shouldStop = false;


//this function processes one sqs message
const processMessage = async (message) => {
  let body;
  try {
    body = JSON.parse(message.Body);  //since the JSON was converted into JSON string while sending to SQS
  } catch (err) {
    logger.error('Failed to parse SQS message body:', { body: message.Body, error: err.message });
    return;
  }

  const { type, payload } = body; 

  try {
    logger.info('Processing notification:', { type });
    await processNotification(type, payload);
    logger.info('Notification processed successfully:', { type });
  } catch (err) {
    logger.error('Failed to process notification:', { type, error: err.message });
    // re-throw to prevent acknowledgement, message stays in queue for retry
    throw err;
  }
};

//once processing is completed, delete the msg
const deleteMessage = async (receiptHandle) => {
  const command = new DeleteMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    ReceiptHandle: receiptHandle, //permissions
  });
  await sqsClient.send(command);//remove the msg permanently
};

const poll = async () => {
  if (!SQS_QUEUE_URL) {
    logger.warn('SQS_QUEUE_URL is not configured. Worker is idle.');
    await sleep(30000);
    return;
  }

  //this tells aws to give me messages
  const command = new ReceiveMessageCommand({
    QueueUrl: SQS_QUEUE_URL,
    MaxNumberOfMessages: SQS_MAX_MESSAGES,
    WaitTimeSeconds: SQS_WAIT_TIME_SECONDS,  //long polling
    MessageAttributeNames: ['All'],
  });

  let result;
  try {
    result = await sqsClient.send(command); //recieve all msgs
  } catch (err) {
      console.log(err);
      await sleep(5000);  //wait for 5 sec after an error arise and then poll
      return;
  
  }
    

  const messages = result.Messages || [];

  if (messages.length === 0) {
    return; // long poll returned nothing so loop again immediately
  }

  logger.info(`Received ${messages.length} message(s) from SQS.`);

  //processing multiple msgs independently
  await Promise.allSettled(
    messages.map(async (message) => {
      try {
        await processMessage(message);
        await deleteMessage(message.ReceiptHandle);
        logger.info('SQS message acknowledged and removed.', { messageId: message.MessageId });
      } catch (err) {
        logger.error('Message processing failed; leaving in queue for retry.', {
          messageId: message.MessageId,
          error: err.message,
        });
      }
    })
  );
};

//helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const start = async () => {
  if (isRunning) {
    logger.warn('Notification worker is already running.');
    return;
  }

  isRunning = true;
  shouldStop = false;
  logger.info('Notification worker started. Polling SQS...');

  while (!shouldStop) {
    try {
      await poll();
    } catch (err) {
      logger.error('Unexpected error in poll loop:', err.message);
      await sleep(5000);
    }
  }

  isRunning = false;
  logger.info('Notification worker stopped.');
};

const stop = async () => {
  logger.info('Stopping notification worker...');
  shouldStop = true;
};

export { start, stop };




// Book Appointment API
//         │
//         ▼
// Appointment Service
//         │
//         ▼
// publishEvent()
//         │
//         ▼
// publish()
//         │
//         ▼
// AWS SQS Queue
//         │
//         │ (message waits)
//         ▼
// Notification Worker (polling continuously)
//         │
//         ▼
// processMessage()
//         │
//         ▼
// processNotification()
//         │
//         ▼
// Send Email
//         │
//         ▼
// Delete message from SQS