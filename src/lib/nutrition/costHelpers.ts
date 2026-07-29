export function mealEstimatedCost(item: { estimatedCost?: number; estimatedCostVnd?: number } | null | undefined): number {
  if (!item) return 0;
  if (typeof item.estimatedCost === "number" && Number.isFinite(item.estimatedCost)) return item.estimatedCost;
  if (typeof item.estimatedCostVnd === "number" && Number.isFinite(item.estimatedCostVnd)) return item.estimatedCostVnd;
  return 0;
}

export function batchEstimatedCost(batch: { estimatedCost?: number; estimatedCostVnd?: number } | null | undefined): number {
  return mealEstimatedCost(batch);
}
