import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp, addSecurityHeaders } from "@/lib/security";

const service = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`upload-room:${ip}`, 20, 60_000);
  if (!allowed) {
    return addSecurityHeaders(NextResponse.json({ error: "Terlalu banyak request" }, { status: 429 }));
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return addSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    // Verify admin role via service (bypass RLS)
    const { data: profile } = await service.from("users").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin" && profile?.role !== "superadmin") {
      return addSecurityHeaders(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return addSecurityHeaders(NextResponse.json({ error: "File wajib" }, { status: 400 }));
    }
    if (file.size > 5 * 1024 * 1024) {
      return addSecurityHeaders(NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 }));
    }
    if (!file.type.startsWith("image/")) {
      return addSecurityHeaders(NextResponse.json({ error: "File harus berupa gambar" }, { status: 400 }));
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return addSecurityHeaders(NextResponse.json({ error: "Format harus JPG, PNG, WebP" }, { status: 400 }));
    }

    const ext = file.name.split(".").pop()?.toLowerCase()?.replace(/[^a-z]/g, "") ?? "jpg";
    const allowedFolders: Record<string, string> = { main: "rooms", map: "maps", tour: "tours" };
    const folder = allowedFolders[type] ?? "rooms";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadErr } = await service.storage
      .from("payment-proofs")
      .upload(path, bytes, { contentType: file.type, cacheControl: "3600", upsert: false });

    if (uploadErr) {
      return addSecurityHeaders(NextResponse.json({ error: "Upload gagal" }, { status: 500 }));
    }

    const { data: { publicUrl } } = service.storage.from("payment-proofs").getPublicUrl(path);
    return addSecurityHeaders(NextResponse.json({ success: true, url: publicUrl }));

  } catch {
    return addSecurityHeaders(NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 }));
  }
}
