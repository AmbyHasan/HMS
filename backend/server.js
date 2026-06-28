import dotenv from "dotenv";
import app from "./src/app.js";
import sequelize, { connectDB } from "./src/config/db/db.js";
import logger from "./src/config/logger.js";


dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`Server running at http://localhost:${PORT}`);
    });

    return server;
  } catch (error) {
    logger.error(`Unable to connect to database: ${error.message}`);
    process.exit(1);
  }
};

startServer();