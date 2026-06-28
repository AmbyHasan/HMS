import {publish} from "../queue/sqs.publisher.js"
import logger from "../utils/logger.js";

const publishEvent = async (type, payload) => {
  try {
    await publish({ type, payload });
  } catch (error) {
    // notification failure must never break the main API response
    logger.error('Failed to publish notification event to SQS:', {
      type,
      error: error.message,
    });
  }
};

export default publishEvent ;
