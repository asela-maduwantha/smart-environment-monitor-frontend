import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)} {...props} />; }
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("p-5 pb-2", className)} {...props} />; }
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("p-5 pt-3", className)} {...props} />; }
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) { return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", className)} {...props} />; }
export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={cn("inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />; }
export function Skeleton({ className }: { className?: string }) { return <div className={cn("animate-pulse rounded-lg bg-slate-200", className)} />; }
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={cn("h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100", props.className)} />; }
