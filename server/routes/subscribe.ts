import { RequestHandler } from "express";

export const handleSubscribe: RequestHandler = (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== "string") return res.status(400).json({ ok: false, error: "Email required" });
  // In production, forward to mailing list provider
  res.json({ ok: true });
};
