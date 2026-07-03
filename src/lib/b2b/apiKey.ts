export function validateB2BApiKey(request: Request): boolean {
  const expected = process.env.B2B_API_KEY?.trim();
  if (!expected) return false;
  const header = request.headers.get("x-b2b-api-key");
  return header === expected;
}
