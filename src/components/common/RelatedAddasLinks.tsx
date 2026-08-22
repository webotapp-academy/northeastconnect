import Link from "next/link";
import type { AddaDef } from "@/lib/addas";

export default function RelatedAddasLinks({ addas, label = "Discussed in" }: { addas: AddaDef[]; label?: string }) {
  if (addas.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      {addas.map((adda) => (
        <Link
          key={adda.id}
          href={`/addas/${adda.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition"
        >
          <span>{adda.icon}</span> {adda.name}
        </Link>
      ))}
    </div>
  );
}
