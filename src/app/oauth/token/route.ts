export function POST() {
  return Response.json(
    {
      error: "authorization_not_enabled",
      error_description: "This public MVP does not currently issue OAuth access tokens."
    },
    { status: 501 }
  );
}
