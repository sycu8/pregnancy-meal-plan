export function GET() {
  const fingerprint = process.env.ANDROID_SHA256_FINGERPRINT ?? "REPLACE_WITH_RELEASE_SHA256_FINGERPRINT";
  const body = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "info.mebauangi.app",
        sha256_cert_fingerprints: [fingerprint]
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
