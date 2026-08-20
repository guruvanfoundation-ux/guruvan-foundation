import { Router } from "express";
import Contact from "../models/Contact.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ error: "Name, email and message are required." });
    await Contact.create({ name, email, subject, message });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Could not send message. Try again." });
  }
});

export default router;
