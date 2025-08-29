import { RequestHandler } from "express";

export const handleContact: RequestHandler = (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ ok: false, error: "Missing fields" });
  // In production, forward to inbox/helpdesk
  res.json({ ok: true });
};
