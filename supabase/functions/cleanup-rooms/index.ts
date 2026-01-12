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

    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    // 1. Find old waiting rooms (24+ hours)
    const { data: oldRooms, error: findOldError } = await supabase
      .from("rooms")
      .select("id, code, name, created_at")
      .eq("status", "waiting")
      .lt("updated_at", twentyFourHoursAgo.toISOString());

    if (findOldError) {
      throw findOldError;
    }

    // 2. Find rooms where host left more than 10 minutes ago
    // Get all waiting rooms
    const { data: waitingRooms, error: findWaitingError } = await supabase
      .from("rooms")
      .select("id, code, name, host_id, updated_at")
      .eq("status", "waiting");

    if (findWaitingError) {
      throw findWaitingError;
    }

    // Check which rooms have no host in room_players
    const hostlessRooms: Array<{ id: string; code: string; name: string }> = [];

    for (const room of waitingRooms || []) {
      // Check if host is still in the room
      const { data: hostPlayer, error: hostError } = await supabase
        .from("room_players")
        .select("id")
        .eq("room_id", room.id)
        .eq("is_host", true)
        .maybeSingle();

      if (hostError) {
        console.error(`Error checking host for room ${room.code}:`, hostError);
        continue;
      }

      // If no host and room updated more than 10 minutes ago, mark for deletion
      if (!hostPlayer && new Date(room.updated_at) < tenMinutesAgo) {
        hostlessRooms.push({ id: room.id, code: room.code, name: room.name });
      }
    }

    // Combine rooms to delete (avoid duplicates)
    const oldRoomIds = (oldRooms || []).map((r) => r.id);
    const hostlessRoomIds = hostlessRooms.map((r) => r.id);
    const allRoomIds = [...new Set([...oldRoomIds, ...hostlessRoomIds])];

    if (allRoomIds.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No rooms to clean up", 
          deleted: 0,
          oldRooms: 0,
          hostlessRooms: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete room_players first (foreign key constraint)
    const { error: playersError } = await supabase
      .from("room_players")
      .delete()
      .in("room_id", allRoomIds);

    if (playersError) {
      console.error("Error deleting room_players:", playersError);
    }

    // Delete the rooms
    const { error: roomsError } = await supabase
      .from("rooms")
      .delete()
      .in("id", allRoomIds);

    if (roomsError) {
      throw roomsError;
    }

    console.log(`Cleaned up ${allRoomIds.length} rooms:`);
    console.log(`  - ${oldRoomIds.length} old rooms (24h+):`, (oldRooms || []).map(r => r.code));
    console.log(`  - ${hostlessRooms.length} hostless rooms (10min+):`, hostlessRooms.map(r => r.code));

    return new Response(
      JSON.stringify({
        message: `Deleted ${allRoomIds.length} rooms`,
        deleted: allRoomIds.length,
        oldRooms: oldRoomIds.length,
        hostlessRooms: hostlessRooms.length,
        details: {
          old: (oldRooms || []).map((r) => ({ code: r.code, name: r.name })),
          hostless: hostlessRooms.map((r) => ({ code: r.code, name: r.name })),
        }
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
