import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.config.js";

const router = Router();

router.all('/*splat', toNodeHandler(auth));

export default router;
