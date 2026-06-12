export function GET() {
  return Response.json(
    { keys: [] },
    {
      headers: {
        "Cache-Control": "public, max-age=3600"
      }
    }
  );
}
