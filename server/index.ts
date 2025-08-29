import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSubscribe } from "./routes/subscribe";
import { handleContact } from "./routes/contact";
import { handleCreateIntent } from "./routes/stripe";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  // Stripe webhook must receive raw body
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (await import("./routes/stripe")).handleStripeWebhook);
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
  app.get("/api/stripe/publishable-key", (await import("./routes/stripe")).handlePublicKey);
  app.post("/api/stripe/create-intent", handleCreateIntent);

  return app;
}
