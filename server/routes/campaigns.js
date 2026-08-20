import { Router } from "express";
import Campaign from "../models/Campaign.js";

const router = Router();

const DEFAULTS = [
  {
    title: "Project Virasat Vana",
    slug: "virasat-vana",
    description: "One Tree. One Life. One Legacy. A mission to plant and nurture 10,000 native trees across the region.",
    goalAmount: 1000000,
  },
  {
    title: "ShikshaSetu",
    slug: "shiksha-setu",
    description: "Connecting every child to a brighter future with full school fees, books, stationery and uniforms.",
    goalAmount: 500000,
  },
];

router.get("/", async (_req, res) => {
  let campaigns = await Campaign.find({ active: true }).sort("createdAt");
  if (campaigns.length === 0) {
    campaigns = await Campaign.insertMany(DEFAULTS);
  }
  res.json(campaigns);
});

export default router;
