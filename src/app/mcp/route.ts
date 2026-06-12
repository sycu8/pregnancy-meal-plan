export function GET() {
  return Response.json(
    {
      error: "mcp_transport_not_enabled",
      error_description: "The MCP server card is published for discovery, but no live MCP transport is enabled in this MVP."
    },
    { status: 501 }
  );
}
