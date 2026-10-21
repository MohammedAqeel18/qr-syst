
import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "QR System API is running",
  });
});

async function startServer(): Promise<void> {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

void startServer();
