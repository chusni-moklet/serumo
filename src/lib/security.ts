import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ============================================================
// RATE LIMITING (in-memory, simple — untuk production pakai Redis)
// ============================================================
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  identifier: string,
  maxRequests = 10,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = identifier;
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  existing.count++;
  return { allowed: true, remaining: maxRequests - existing.count };
}

// ============================================================
// GET CLIENT IP
// ============================================================
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ============================================================
// SECURITY HEADERS
// ============================================================
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

// ============================================================
// INPUT SANITIZATION
// ============================================================
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove basic XSS chars
    .slice(0, 1000); // Max length
}

// ============================================================
// VALIDATION SCHEMAS (Zod)
// ============================================================
export const bookingSchema = z.object({
  room_id: z.string().uuid("Room ID tidak valid"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid"),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Format jam tidak valid"),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Format jam tidak valid"),
  notes: z.string().max(500).optional(),
});

export const adminCreateSchema = z.object({
  email: z.string().email("Email tidak valid").max(255),
  password: z.string().min(8, "Password minimal 8 karakter").max(72),
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6).max(72),
});

// ============================================================
// VERIFY SERVICE ROLE USAGE
// ============================================================
export function ensureServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error("This function must only be called server-side");
  }
}

// ============================================================
// SAFE ERROR — don't leak internal details
// ============================================================
export function safeError(err: unknown, fallback = "Terjadi kesalahan"): string {
  if (process.env.NODE_ENV === "development" && err instanceof Error) {
    return err.message;
  }
  return fallback;
}
