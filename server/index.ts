import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSubscribe } from "./routes/subscribe";
import { handleContact } from "./routes/contact";
import {
  handleCreateIntent,
  handleStripeWebhook,
  handlePublicKey,
} from "./routes/stripe";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use((req, res, next) => {
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Robots-Tag", "noindex, noarchive");
    next();
  });
  // Stripe webhook must receive raw body
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook,
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/subscribe", handleSubscribe);
  app.post("/api/contact", handleContact);
  app.get("/api/stripe/publishable-key", handlePublicKey);
  app.post("/api/stripe/create-intent", handleCreateIntent);

  // Minimal endpoints
  app.get("/api/ai/poem", (_req, res) => {
    res.json({ line: "Tonight the windows learn the names of stars." });
  });
  app.post("/api/achievements", (req, res) => {
    console.log("achievements", req.body);
    res.json({ ok: true });
  });
  app.post("/api/feedback", (req, res) => {
    console.log("feedback", req.body);
    res.json({ ok: true });
  });

  return app;
}
