
import express from "express";

const app = express();

const PORT = 5000;

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "QR System API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
