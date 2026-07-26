export function GET() {
  const teamId = process.env.APPLE_TEAM_ID ?? "TEAMID";
  const body = {
    applinks: {
      apps: [],
      details: [
        {
          appID: `${teamId}.info.mebauangi.app`,
          paths: ["/result", "/vi/result", "/planner", "/vi/planner", "/history", "/vi/history", "/support", "/vi/support"]
        }
      ]
    }
  };

  return Response.json(body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
