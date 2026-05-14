// server/src/features/auth/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/jwt";
import { AppError } from "../../middleware/error.middleware";
import { registerSchema, loginSchema, refreshSchema } from "./auth.schemas";
import { AuthRequest } from "../../middleware/auth.middleware";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash,
        initialBalance: body.initialBalance,
        currency: body.currency,
      },
      select: {
        id: true,
        email: true,
        name: true,
        initialBalance: true,
        currency: true,
        createdAt: true,
      },
    });

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshTokenValue = signRefreshToken({ userId: user.id, email: user.email });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: { token: refreshTokenValue, userId: user.id, expiresAt },
    });

    res.status(201).json({
      success: true,
      data: { user, accessToken, refreshToken: refreshTokenValue },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid email or password", 401);
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshTokenValue = signRefreshToken({ userId: user.id, email: user.email });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: { token: refreshTokenValue, userId: user.id, expiresAt },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          initialBalance: user.initialBalance,
          currency: user.currency,
          createdAt: user.createdAt,
        }, accessToken,
        refreshToken: refreshTokenValue,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken: token } = refreshSchema.parse(req.body);

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const payload = verifyRefreshToken(token);
    const newAccessToken = signAccessToken({ userId: payload.userId, email: payload.email });

    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        initialBalance: true,
        currency: true,
        createdAt: true,
      },
    });
    if (!user) throw new AppError("User not found", 404);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}
