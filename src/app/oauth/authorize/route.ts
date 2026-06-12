export function GET() {
  return Response.json(
    {
      error: "authorization_not_enabled",
      error_description: "This public MVP does not currently require OAuth authorization."
    },
    { status: 501 }
  );
}
