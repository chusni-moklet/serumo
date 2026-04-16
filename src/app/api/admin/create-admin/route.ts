import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp, addSecurityHeaders, adminCreateSchema, sanitizeString } from "@/lib/security";

const service = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`create-admin:${ip}`, 5, 60_000); // max 5/min
  if (!allowed) {
    return addSecurityHeaders(NextResponse.json({ error: "Terlalu banyak request" }, { status: 429 }));
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return addSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));

    const { data: me } = await service.from("users").select("role").eq("id", user.id).single();
    if (me?.role !== "superadmin") {
      return addSecurityHeaders(NextResponse.json({ error: "Hanya superadmin yang bisa menambah admin" }, { status: 403 }));
    }

    const body = await req.json();

    // Validate with Zod
    const parsed = adminCreateSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      const msg = firstError?.message ?? "Input tidak valid";
      return addSecurityHeaders(NextResponse.json({ error: msg }, { status: 400 }));
    }

    const { email, password, name } = parsed.data;
    const safeName = sanitizeString(name);

    const { data: allUsers } = await service.auth.admin.listUsers();
    const existing = allUsers?.users?.find((u) => u.email === email);

    if (existing) {
      await service.from("users").upsert(
        { id: existing.id, name: safeName, email, role: "admin" },
        { onConflict: "id" }
      );
      return addSecurityHeaders(NextResponse.json({ success: true, message: "Role diperbarui ke admin" }));
    }

    const { data: authData, error: authErr } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authErr || !authData.user) {
      return addSecurityHeaders(NextResponse.json({ error: "Gagal membuat akun" }, { status: 500 }));
    }

    const { error: profileErr } = await service.from("users").insert({
      id: authData.user.id,
      name: safeName,
      email,
      role: "admin",
    });

    if (profileErr) {
      // Rollback auth user
      await service.auth.admin.deleteUser(authData.user.id);
      return addSecurityHeaders(NextResponse.json({ error: "Gagal membuat profil" }, { status: 500 }));
    }

    return addSecurityHeaders(NextResponse.json({ success: true, message: "Admin berhasil dibuat" }));

  } catch {
    return addSecurityHeaders(NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 }));
  }
}
