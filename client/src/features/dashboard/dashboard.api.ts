// client/src/features/dashboard/dashboard.api.ts
import api from "@/lib/api";
import { DashboardStats } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<{ success: boolean; data: DashboardStats }>(
    "/trades/stats/dashboard"
  );
  return data.data!;
}
