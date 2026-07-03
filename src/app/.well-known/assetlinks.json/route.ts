export function GET() {
  const body = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "info.mebauangi.app",
        sha256_cert_fingerprints: ["REPLACE_WITH_RELEASE_SHA256_FINGERPRINT"]
      }
    }
  ];

  return Response.json(body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
