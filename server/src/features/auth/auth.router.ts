// server/src/features/auth/auth.router.ts
import { Router } from "express";
import { register, login, refreshToken, logout, me } from "./auth.controller";
import { authenticate } from "../../middleware/auth.middleware";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refreshToken);
authRouter.post("/logout", authenticate, logout);
authRouter.get("/me", authenticate, me);
