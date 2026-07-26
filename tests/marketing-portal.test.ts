import { describe, expect, it } from "vitest";
import { assertMarketingAuth, marketingSecrets } from "@/lib/marketing/auth";
import { getMarketingStatus } from "@/lib/marketing/status";
import { appendMarketingActivity, readMarketingActivity } from "@/lib/marketing/activity";

describe("marketing portal + automation auth", () => {
  it("rejects requests without a configured bearer secret", () => {
    const prevMarketing = process.env.MARKETING_API_KEY;
    const prevCron = process.env.CRON_SECRET;
    delete process.env.MARKETING_API_KEY;
    delete process.env.CRON_SECRET;

    const result = assertMarketingAuth(new Request("https://example.test/api/marketing/status"));
    expect(result.ok).toBe(false);

    process.env.MARKETING_API_KEY = prevMarketing;
    process.env.CRON_SECRET = prevCron;
  });

  it("accepts MARKETING_API_KEY or CRON_SECRET bearer tokens", () => {
    process.env.CRON_SECRET = "test-cron-secret";
    delete process.env.MARKETING_API_KEY;
    expect(marketingSecrets()).toContain("test-cron-secret");

    const ok = assertMarketingAuth(
      new Request("https://example.test/api/marketing/status", {
        headers: { Authorization: "Bearer test-cron-secret" }
      })
    );
    expect(ok.ok).toBe(true);

    const viaHeader = assertMarketingAuth(
      new Request("https://example.test/api/marketing/hooks/zapier", {
        headers: { "x-api-key": "test-cron-secret" }
      })
    );
    expect(viaHeader.ok).toBe(true);
  });

  it("builds marketing status with connections, queue and automation endpoints", async () => {
    const status = await getMarketingStatus("en");
    expect(status.ok).toBe(true);
    expect(status.connections.length).toBe(2);
    expect(status.connections.map((c) => c.platform)).toEqual(["x", "facebook"]);
    expect(status.automation.endpoints.publish).toContain("/api/marketing/publish");
    expect(status.automation.endpoints.zapierHook).toContain("/api/marketing/hooks/zapier");
    expect(status.queue.count).toBeGreaterThan(0);
  });

  it("appends activity events for the portal timeline", async () => {
    const event = await appendMarketingActivity({
      action: "drafts",
      source: "n8n",
      live: false,
      note: "unit-test"
    });
    const activity = await readMarketingActivity();
    expect(activity[0]?.id).toBe(event.id);
    expect(activity[0]?.source).toBe("n8n");
  });
});
