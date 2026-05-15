import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/admin/login');

  const [subscribers, contacts, events, products, orders] = await Promise.all([
    prisma.newsletterSubscriber.count({ where: { status: 'CONFIRMED' } }),
    prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
    prisma.event.count({ where: { status: 'PUBLISHED', startsAt: { gte: new Date() } } }),
    prisma.product.count({ where: { active: true } }),
    prisma.order.count({ where: { status: 'PAID' } }),
  ]);

  const cards = [
    { label: 'Abonnés newsletter', value: subscribers, href: '/admin/newsletter' },
    { label: 'Contacts non lus', value: contacts, href: '/admin/contact' },
    { label: 'Événements à venir', value: events, href: '/admin/events' },
    { label: 'Produits actifs', value: products, href: '/admin/products' },
    { label: 'Commandes payées', value: orders, href: '/admin/orders' },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Tableau de bord</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}
            className="bg-bgAlt border border-border rounded-lg p-5 hover:border-primary/60 transition">
            <p className="text-sm text-textMuted">{c.label}</p>
            <p className="text-3xl font-display text-primary mt-2">{c.value}</p>
          </Link>
        ))}
      </div>
      <p className="mt-12 text-sm text-textMuted">CRUD complet : voir Phase 4 (à venir).</p>
    </div>
  );
}
