import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  ShieldAlert, Mail, Calendar, Sparkles, ShoppingBag, Eye,
  Package, Truck, Users, Image as ImageIcon, BarChart3, MapPin,
  Globe, Heart, MessageSquare, Tag,
} from 'lucide-react';
import { StatCard, MetricCard, SectionHeader } from '@/components/admin/StatCard';
import { formatPrice } from '@/lib/format';

export default async function AdminDashboard() {
  const s = await getServerSession(authOptions);
  if (!s) redirect('/admin/login');

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    pendingPhotos, approvedPhotos, totalPhotos,
    contactsUnread, subsConfirmed, subsPending,
    eventsUpcoming, scheduledPosts,
    ordersAll, ordersPaid, ordersRefunded, ordersFailed,
    products, coupons,
    revenueAgg,
    viewsTotal, views7d, views30d,
    topPagesRaw, topCountriesRaw, recentOrders,
  ] = await Promise.all([
    prisma.photo.count({ where: { status: 'PENDING' } }).catch(() => 0),
    prisma.photo.count({ where: { status: 'APPROVED' } }).catch(() => 0),
    prisma.photo.count().catch(() => 0),
    prisma.contactMessage.count({ where: { status: 'UNREAD' } }).catch(() => 0),
    prisma.newsletterSubscriber.count({ where: { status: 'CONFIRMED' } }).catch(() => 0),
    prisma.newsletterSubscriber.count({ where: { status: 'PENDING' } }).catch(() => 0),
    prisma.event.count({ where: { status: 'PUBLISHED', startsAt: { gte: now } } }).catch(() => 0),
    prisma.scheduledPost.count({ where: { status: 'PENDING', scheduledAt: { gte: now } } }).catch(() => 0),
    prisma.order.count().catch(() => 0),
    prisma.order.count({ where: { status: 'PAID' } }).catch(() => 0),
    prisma.order.count({ where: { status: 'REFUNDED' } }).catch(() => 0),
    prisma.order.count({ where: { status: 'FAILED' } }).catch(() => 0),
    prisma.product.count({ where: { active: true } }).catch(() => 0),
    prisma.coupon.count({ where: { active: true } }).catch(() => 0),
    prisma.order.aggregate({ _sum: { totalCents: true }, where: { status: 'PAID' } }).catch(() => ({ _sum: { totalCents: 0 } })),
    prisma.pageView.count().catch(() => 0),
    prisma.pageView.count({ where: { createdAt: { gte: sevenDaysAgo } } }).catch(() => 0),
    prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }).catch(() => 0),
    prisma.pageView.groupBy({ by: ['path'], where: { createdAt: { gte: thirtyDaysAgo } }, _count: { _all: true }, orderBy: { _count: { path: 'desc' } }, take: 6 }).catch(() => []),
    prisma.pageView.groupBy({ by: ['country'], where: { createdAt: { gte: thirtyDaysAgo }, country: { not: null } }, _count: { _all: true }, orderBy: { _count: { country: 'desc' } }, take: 6 }).catch(() => []),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { items: true } }).catch(() => []),
  ]);

  const revenue = revenueAgg._sum.totalCents ?? 0;
  const userName = (s.user as any)?.name || s.user?.email || 'Admin';

  // Sparkline data : visites par jour des 7 derniers jours (simulation depuis topPagesRaw si vide)
  const sparkPoints = await prisma.pageView.groupBy({
    by: ['createdAt'],
    where: { createdAt: { gte: sevenDaysAgo } },
    _count: { _all: true },
  }).catch(() => []);

  return (
    <div>
      {/* Bandeau hero "neo" — gradient animé + glow */}
      <div className="relative rounded-xl p-6 mb-6 overflow-hidden border border-primary/40 bg-gradient-to-r from-primary/30 via-secondary/40 to-primary/30 shadow-[0_0_60px_rgba(201,162,75,0.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,162,75,0.4),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(182,107,58,0.4),transparent_50%)] pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-bg/60 border border-primary flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(201,162,75,0.5)]">📊</div>
          <div>
            <h1 className="font-display text-3xl tracking-tight">Tableau de bord</h1>
            <p className="text-sm text-textMuted mt-1">Bienvenue <span className="text-primary font-medium">{userName}</span> · {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* 🛍 Boutique & Ventes */}
      <SectionHeader icon="ti-shopping-bag" label="Boutique & Ventes" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard href="/admin/orders" label="Commandes total" value={ordersAll} icon={<ShoppingBag />} gradient="from-pink-500 to-rose-600" />
        <StatCard href="/admin/orders" label="Commandes payées" value={ordersPaid} icon={<Package />} gradient="from-blue-500 to-indigo-600" />
        <StatCard href="/admin/orders" label="Échouées" value={ordersFailed} icon={<Truck />} gradient="from-purple-500 to-violet-600" />
        <StatCard href="/admin/orders" label="Chiffre d'affaires" value={formatPrice(revenue)} icon={<BarChart3 />} gradient="from-emerald-500 to-green-600" />
        <StatCard href="/admin/products" label="Produits actifs" value={products} icon={<Tag />} gradient="from-orange-500 to-amber-600" />
      </div>

      {/* 👁 Audience & Visites */}
      <SectionHeader icon="ti-eye" label="Audience & Visites" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Vues totales" value={viewsTotal.toLocaleString('fr-FR')} icon={<Eye />} gradient="from-blue-500 to-cyan-600" />
        <StatCard label="Vues 7 jours" value={views7d.toLocaleString('fr-FR')} icon={<BarChart3 />} gradient="from-fuchsia-500 to-pink-600" />
        <StatCard label="Vues 30 jours" value={views30d.toLocaleString('fr-FR')} icon={<BarChart3 />} gradient="from-purple-500 to-violet-600" />
        <StatCard href="/admin/newsletter" label="Abonnés newsletter" value={subsConfirmed} sub={subsPending > 0 ? `${subsPending} en attente` : undefined} icon={<Mail />} gradient="from-rose-500 to-pink-600" />
        <div className="bg-bgAlt border border-border rounded-xl p-4 min-h-[120px] flex flex-col">
          <p className="text-xs text-primary uppercase tracking-wider">Visites · 7 derniers jours</p>
          <Sparkline points={sparkPoints.map(p => p._count._all)} />
          <p className="text-xs text-textMuted text-center mt-1">Total : {views7d.toLocaleString('fr-FR')}</p>
        </div>
      </div>

      {/* 📸 Photos & Contenu */}
      <SectionHeader icon="ti-photo" label="Photos & Contenu" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard href="/admin/medias?status=pending" label="Photos en modération" value={pendingPhotos} icon={<ShieldAlert />} gradient="from-amber-500 to-orange-600" />
        <StatCard href="/admin/medias?status=approved" label="Photos publiées" value={approvedPhotos} icon={<ImageIcon />} gradient="from-teal-500 to-emerald-600" />
        <StatCard label="Total contributions" value={totalPhotos} icon={<Users />} gradient="from-blue-500 to-sky-600" />
        <StatCard label="Posts programmés" value={scheduledPosts} icon={<Calendar />} gradient="from-purple-500 to-fuchsia-600" />
      </div>

      {/* 🗓 Top pages + Top pays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-bgAlt border border-border rounded-xl p-5">
          <h3 className="flex items-center gap-2 font-display text-lg mb-4"><BarChart3 className="w-5 h-5 text-primary" />Top pages (30j)</h3>
          {topPagesRaw.length === 0 ? (
            <p className="text-sm text-textMuted italic">Aucune visite enregistrée. <Link href="/admin/integrations" className="text-primary">Activer le tracking</Link>.</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {topPagesRaw.map((p, i) => (
                <li key={p.path} className="flex items-center justify-between">
                  <span className="flex items-center gap-3"><span className="text-textMuted w-5">{i + 1}</span><code className="text-text">{p.path}</code></span>
                  <span className="text-primary font-mono">{p._count._all.toLocaleString('fr-FR')}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="bg-bgAlt border border-border rounded-xl p-5">
          <h3 className="flex items-center gap-2 font-display text-lg mb-4"><Globe className="w-5 h-5 text-primary" />Top pays (30j)</h3>
          {topCountriesRaw.length === 0 ? (
            <p className="text-sm text-textMuted italic">Géolocalisation visiteurs : nécessite Cloudflare ou Vercel devant.</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {topCountriesRaw.map((c, i) => (
                <li key={c.country ?? 'XX'} className="flex items-center justify-between">
                  <span className="flex items-center gap-3"><span className="text-textMuted w-5">{i + 1}</span><span>{c.country}</span></span>
                  <span className="text-primary font-mono">{c._count._all.toLocaleString('fr-FR')}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* 💳 Dernières commandes */}
      <div className="bg-bgAlt border border-border rounded-xl p-5 mt-6">
        <h3 className="flex items-center gap-2 font-display text-lg mb-4"><ShoppingBag className="w-5 h-5 text-primary" />Dernières commandes</h3>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-textMuted italic">Aucune commande pour le moment.</p>
        ) : (
          <ul className="space-y-2">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0">
                <span className="flex items-center gap-3">
                  <code className="text-xs font-mono text-textMuted">#{o.number.toLowerCase().slice(-8)}</code>
                  <span>{o.email}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-textMuted">{o.items.length} article{o.items.length > 1 ? 's' : ''}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${o.status === 'PAID' ? 'bg-success/20 text-success' : o.status === 'FAILED' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>{o.status}</span>
                  <span className="text-primary font-mono">{formatPrice(o.totalCents)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length === 0) {
    return <div className="flex-1 flex items-center justify-center text-xs text-textMuted">Aucune donnée</div>;
  }
  const max = Math.max(...points, 1);
  const W = 200, H = 60;
  const stepX = W / Math.max(points.length - 1, 1);
  const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${H - (v / max) * H}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="flex-1 mt-2">
      <path d={path} stroke="rgb(var(--primary))" strokeWidth={2} fill="none" />
    </svg>
  );
}
