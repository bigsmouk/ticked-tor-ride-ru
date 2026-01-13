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

    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    // 1. Find old waiting rooms (24+ hours)
    const { data: oldRooms, error: findOldError } = await supabase
      .from("rooms")
      .select("id, code, name, created_at")
      .eq("status", "waiting")
      .lt("updated_at", twentyFourHoursAgo.toISOString());

    if (findOldError) {
      throw findOldError;
    }

    // 2. Find all waiting rooms to check player status
    const { data: waitingRooms, error: findWaitingError } = await supabase
      .from("rooms")
      .select("id, code, name, host_id, updated_at")
      .eq("status", "waiting");

    if (findWaitingError) {
      throw findWaitingError;
    }

    // Check which rooms have no host or no players at all
    const hostlessRooms: Array<{ id: string; code: string; name: string }> = [];
    const emptyRooms: Array<{ id: string; code: string; name: string }> = [];

    for (const room of waitingRooms || []) {
      // Get all players in the room
      const { data: players, error: playersError } = await supabase
        .from("room_players")
        .select("id, is_host")
        .eq("room_id", room.id);

      if (playersError) {
        console.error(`Error checking players for room ${room.code}:`, playersError);
        continue;
      }

      const playerCount = players?.length || 0;
      const hasHost = players?.some(p => p.is_host) || false;

      // 3. Empty rooms (no players at all) - delete after 5 minutes
      if (playerCount === 0 && new Date(room.updated_at) < fiveMinutesAgo) {
        emptyRooms.push({ id: room.id, code: room.code, name: room.name });
        continue;
      }

      // 4. Rooms with players but no host - delete after 10 minutes
      if (!hasHost && new Date(room.updated_at) < tenMinutesAgo) {
        hostlessRooms.push({ id: room.id, code: room.code, name: room.name });
      }
    }

    // Combine rooms to delete (avoid duplicates)
    const oldRoomIds = (oldRooms || []).map((r) => r.id);
    const hostlessRoomIds = hostlessRooms.map((r) => r.id);
    const emptyRoomIds = emptyRooms.map((r) => r.id);
    const allRoomIds = [...new Set([...oldRoomIds, ...hostlessRoomIds, ...emptyRoomIds])];

    if (allRoomIds.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No rooms to clean up", 
          deleted: 0,
          oldRooms: 0,
          hostlessRooms: 0,
          emptyRooms: 0
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
    console.log(`  - ${emptyRoomIds.length} empty rooms (5min+):`, emptyRooms.map(r => r.code));

    return new Response(
      JSON.stringify({
        message: `Deleted ${allRoomIds.length} rooms`,
        deleted: allRoomIds.length,
        oldRooms: oldRoomIds.length,
        hostlessRooms: hostlessRooms.length,
        emptyRooms: emptyRoomIds.length,
        details: {
          old: (oldRooms || []).map((r) => ({ code: r.code, name: r.name })),
          hostless: hostlessRooms.map((r) => ({ code: r.code, name: r.name })),
          empty: emptyRooms.map((r) => ({ code: r.code, name: r.name })),
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
