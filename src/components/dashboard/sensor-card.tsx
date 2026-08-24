import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui";

export function SensorCard({ title, value, unit, status, detail, icon: Icon, color = "blue" }: { title: string; value: string; unit?: string; status: string; detail?: string; icon: LucideIcon; color?: "blue" | "cyan" | "amber" | "violet" }) {
  const colors = { blue: "bg-blue-50 text-blue-600", cyan: "bg-cyan-50 text-cyan-600", amber: "bg-amber-50 text-amber-600", violet: "bg-violet-50 text-violet-600" };
  return <Card><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value} <span className="text-lg font-medium text-slate-500">{unit}</span></p></div><span className={`rounded-xl p-2.5 ${colors[color]}`}><Icon className="h-5 w-5"/></span></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-sm font-medium text-emerald-700">{status}</span>{detail && <span className="text-xs text-slate-500">{detail}</span>}</div></CardContent></Card>;
}
