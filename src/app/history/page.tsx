import { HistoryList } from "@/components/history/HistoryList";

export default function HistoryPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Lịch sử thực đơn</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Không cần tài khoản. Lịch sử chỉ nằm trên trình duyệt của bạn.</p>
      </div>
      <HistoryList />
    </main>
  );
}
