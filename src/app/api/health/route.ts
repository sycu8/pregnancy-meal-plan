export function GET() {
  return Response.json({
    status: "ok",
    service: "pregnancy-meal-planner",
    timestamp: new Date().toISOString()
  });
}
