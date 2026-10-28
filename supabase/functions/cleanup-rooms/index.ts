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
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    const { data: candidates, error: findError } = await supabase
      .from("rooms")
      .select("id, code, name, created_at, updated_at")
      .eq("status", "waiting")
      .lt("created_at", threeMinutesAgo);
    if (findError) throw findError;

    const emptyRooms: Array<{ id: string; code: string; name: string }> = [];
    for (const room of candidates || []) {
      const { count, error } = await supabase
        .from("room_players")
        .select("id", { count: "exact", head: true })
        .eq("room_id", room.id);
      if (error) throw error;
      if (count === 0) emptyRooms.push({ id: room.id, code: room.code, name: room.name });
    }
    const allRoomIds = emptyRooms.map(room => room.id);

    if (allRoomIds.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No rooms to clean up", 
          deleted: 0,
          emptyRooms: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Recheck immediately before deletion: a player may have joined meanwhile.
    // Delete only the rooms still empty, and fail safely if the check fails.
    const deletedRooms: typeof emptyRooms = [];
    for (const room of emptyRooms) {
      const { count, error: countError } = await supabase
        .from("room_players")
        .select("id", { count: "exact", head: true })
        .eq("room_id", room.id);
      if (countError) throw countError;
      if (count !== 0) continue;
      const { data: deleted, error: deleteError } = await supabase
        .from("rooms")
        .delete()
        .eq("id", room.id)
        .eq("status", "waiting")
        .select("id");
      if (deleteError) throw deleteError;
      if (deleted?.length) deletedRooms.push(room);
    }

    return new Response(JSON.stringify({
      message: `Deleted ${deletedRooms.length} empty waiting rooms`,
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
