import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",

  protocol: "postgres",

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },

  logging: false,
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Successfully connected to Neon PostgreSQL.");
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
};

export default sequelize;