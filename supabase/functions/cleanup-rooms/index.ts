import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Delete ONLY waiting rooms that have had no members for at least 3 minutes.
    // Never remove an occupied room just because its updated_at is old.
    const twoMinutesAgo = new Date(Date.now() - 120000).toISOString();
    const { data: candidates, error: findError } = await supabase
      .from("rooms")
      .select("id, code, name, created_at, updated_at")
      .eq("status", "waiting")
      .lt("updated_at", twoMinutesAgo);
    if (findError) throw findError;

    // Atomic conditional delete avoids deleting a room renewed after candidate selection.
    const deletedRooms: Array<{ id: string; code: string; name: string }> = [];
    for (const room of candidates || []) {
      const { data: deleted, error } = await supabase.from("rooms")
        .delete().eq("id", room.id).eq("status", "waiting")
        .lt("updated_at", twoMinutesAgo).select("id");
      if (error) throw error;
      if (deleted?.length) deletedRooms.push(room);
    }

    return new Response(JSON.stringify({
      message: `Deleted ${deletedRooms.length} expired waiting rooms`,
      deleted: deletedRooms.length,
      emptyRooms: deletedRooms.length,
      details: { empty: deletedRooms.map(r => ({ code: r.code, name: r.name })) },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Cleanup error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
