import Link from 'next/link';
import type { ReactNode } from 'react';

export function StatCard({
  href, label, value, icon, gradient, accent, sub,
}: {
  href?: string;
  label: string;
  value: string | number;
  icon: ReactNode;
  gradient: string; // tailwind classes ex "from-pink-500 to-rose-600"
  accent?: 'success' | 'primary' | 'danger' | 'warning' | 'neutral';
  sub?: string;
}) {
  const wrapper = (
    <div className={`relative overflow-hidden rounded-xl p-5 bg-gradient-to-br ${gradient} text-white min-h-[120px] flex flex-col justify-between hover:scale-[1.01] transition`}>
      <div className="flex items-center justify-between">
        <span className="opacity-90 text-2xl">{icon}</span>
      </div>
      <div>
        <div className="text-3xl font-display tracking-tight">{value}</div>
        <div className="text-xs uppercase tracking-wider opacity-90 mt-1">{label}</div>
        {sub && <div className="text-xs opacity-80 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{wrapper}</Link> : wrapper;
}

export function MetricCard({
  label, value, sub,
}: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-bgAlt border border-border rounded-lg p-4">
      <p className="text-xs text-textMuted uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-display text-primary mt-1">{value}</p>
      {sub && <p className="text-xs text-textMuted mt-1">{sub}</p>}
    </div>
  );
}

export function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <h2 className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-textMuted mt-8 mb-3">
      <span className={`ti ${icon}`} aria-hidden /> {label}
    </h2>
  );
}
