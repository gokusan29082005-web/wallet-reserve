import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const merchantEmail = "merchant@dairypay.com";
  const merchantPassword = "merchant123";

  // Check if already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u: any) => u.email === merchantEmail);

  if (existing) {
    return new Response(JSON.stringify({ message: "Merchant already exists", id: existing.id }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Create merchant auth user
  const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
    email: merchantEmail,
    password: merchantPassword,
    email_confirm: true,
    user_metadata: { full_name: "Shop Owner" },
  });

  if (authErr) {
    return new Response(JSON.stringify({ error: authErr.message }), { status: 400 });
  }

  // Add merchant role
  const { error: roleErr } = await supabase.from("user_roles").insert({
    user_id: authUser.user.id,
    role: "merchant",
  });

  if (roleErr) {
    return new Response(JSON.stringify({ error: roleErr.message }), { status: 400 });
  }

  return new Response(
    JSON.stringify({ message: "Merchant created", email: merchantEmail, password: merchantPassword }),
    { headers: { "Content-Type": "application/json" } }
  );
});
