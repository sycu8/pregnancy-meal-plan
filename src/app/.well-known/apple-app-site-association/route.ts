export function GET() {
  const body = {
    applinks: {
      apps: [],
      details: [
        {
          appID: "TEAMID.info.mebauangi.app",
          paths: ["/result", "/en/result", "/planner", "/en/planner", "/history", "/en/history", "/support", "/en/support"]
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
