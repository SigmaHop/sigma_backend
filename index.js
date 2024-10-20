import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config({ path: "./.env" });
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//Initialize Route
import deployRouter from "./routes/deploy.js";
app.use("/api/deploy", deployRouter);

// Listen for requests
app.listen(PORT, () => {
  console.log(`Sigma Backend is running on port ${PORT}`);
});
