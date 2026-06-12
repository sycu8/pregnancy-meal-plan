export function GET() {
  return Response.json({
    status: "ok",
    service: "bau-an-gi",
    timestamp: new Date().toISOString()
  });
}
