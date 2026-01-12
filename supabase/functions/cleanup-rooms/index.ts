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

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Find old waiting rooms
    const { data: oldRooms, error: findError } = await supabase
      .from("rooms")
      .select("id, code, name, created_at")
      .eq("status", "waiting")
      .lt("updated_at", twentyFourHoursAgo.toISOString());

    if (findError) {
      throw findError;
    }

    if (!oldRooms || oldRooms.length === 0) {
      return new Response(
        JSON.stringify({ message: "No old rooms to clean up", deleted: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const roomIds = oldRooms.map((r) => r.id);

    // Delete room_players first (foreign key constraint)
    const { error: playersError } = await supabase
      .from("room_players")
      .delete()
      .in("room_id", roomIds);

    if (playersError) {
      console.error("Error deleting room_players:", playersError);
    }

    // Delete the rooms
    const { error: roomsError } = await supabase
      .from("rooms")
      .delete()
      .in("id", roomIds);

    if (roomsError) {
      throw roomsError;
    }

    console.log(`Cleaned up ${oldRooms.length} old rooms:`, oldRooms.map(r => r.code));

    return new Response(
      JSON.stringify({
        message: `Deleted ${oldRooms.length} inactive rooms`,
        deleted: oldRooms.length,
        rooms: oldRooms.map((r) => ({ code: r.code, name: r.name, created_at: r.created_at })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Cleanup error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
