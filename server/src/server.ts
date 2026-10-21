
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MongoStore from "connect-mongo";

import { connectDB } from "./config/db.ts";
import authRoutes from "./routes/auth.routes.ts";
import qrRoutes from "./routes/qr.routes.js";
import { requireAdmin } from "./middleware/requireAdmin.ts";
import { checkOrigin } from "./middleware/checkOrigin.ts";
import { requireCsrf } from "./middleware/requireCsrf.ts";
import redirectRoutes from "./routes/redirect.routes.ts";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
const SESSION_SECRET = process.env.SESSION_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;

if (!FRONTEND_ORIGIN || !SESSION_SECRET || !MONGODB_URI) {
  throw new Error(
    "FRONTEND_ORIGIN, SESSION_SECRET, and MONGODB_URI are required."
  );
}

if (SESSION_SECRET.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters.");
}

app.disable("x-powered-by");

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));

app.use(
  session({
    name: "qr.sid",
    secret: SESSION_SECRET,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      collectionName: "sessions",
      ttl: 60 * 60 * 8,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
      path: "/",
    },
  })
);

app.use(checkOrigin);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "QR System API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use("/r", redirectRoutes);
app.use("/api/qr", requireAdmin, requireCsrf, qrRoutes);

app.use("/api/analytics", requireAdmin, analyticsRoutes);

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Request failed:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
);


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
