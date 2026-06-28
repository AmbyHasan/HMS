import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

// http request logger
app.use(morgan("dev"));

//it attaches security realted headers when the api's response is sent to the client
app.use(helmet());

// CORS
app.use(cors());

// body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  //it converts url encoded form data into json

// cookies
app.use(cookieParser());


app.use('/api/v1', routes);


//api hit by the deployed url on render
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hospital Management System API is running ..",
  });
});


//health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hospital management system API is operational",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,  //tells the time since when the process started
  });
});

export default app;