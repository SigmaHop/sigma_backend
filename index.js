import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import crypto from "node:crypto";
globalThis.crypto ??= crypto.webcrypto;

// Load environment variables
dotenv.config({ path: "./.env" });
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// //Initialize Route
// import initRouter from "./routes/api/v1/init.js";
// app.use("/api/v1/init", initRouter);

// Listen for requests
app.listen(PORT, () => {
  console.log(`Sigma Backend is running on port ${PORT}`);
});
