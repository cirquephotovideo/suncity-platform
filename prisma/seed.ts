/**
 * Sun City Paris — seed Prisma
 * Idempotent : peut être ré-exécuté sans dupliquer.
 *
 * Usage :
 *   npm run db:seed                # via package.json
 *   npx tsx prisma/seed.ts
 */
import { PrismaClient, DayOfWeek, WeekOfMonth, ProductKind, PageStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'arnaud@gredai.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'SunCity2026!';

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: 'ADMIN', passwordHash },
    create: { email: ADMIN_EMAIL, name: 'Admin Sun City', role: 'ADMIN', passwordHash, emailVerified: new Date() },
  });
  console.log(`✓ Admin: ${user.email}`);
  return user;
}

async function seedSiteSettings() {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      contactPhone: '01 40 09 26 09',
      contactEmail: 'contact@suncity-paris.fr',
      address: '62 boulevard de Sébastopol, 75003 Paris',
      rcs: 'SARL GYM SEBASTOPOL — RCS 45274626600025',
      openingHoursJson: {
        mon: '12:00-02:00',
        tue: '12:00-02:00',
        wed: '12:00-02:00',
        thu: '12:00-02:00',
        fri: '12:00-06:00',
        sat: '12:00-06:00',
        sun: '12:00-02:00',
        notes: { fr: 'Fermeture à 6h les vendredis, samedis et veilles de jours fériés.', en: 'Closing at 6am on Fridays, Saturdays and eves of public holidays.' },
      },
      socialJson: {
        facebook: 'https://www.facebook.com/pages/Suncity-PARIS/189470147925236',
        instagram: 'https://www.instagram.com/suncity_paris/',
        twitter: 'https://twitter.com/SunCityParis',
      },
      partnersJson: [
        { name: 'Playsafe', url: 'https://www.playsafe.fr', category: 'prevention' },
        { name: 'AREMEDIA', url: 'https://www.aremedia.org', category: 'prevention' },
        { name: 'Star City', url: 'https://www.starcity.fr/', category: 'sister-venue' },
      ],
      ageGateEnabled: true,
      ageGateMinAge: 18,
      themeKey: 'sun',
      defaultLocale: 'fr',
    },
  });
  console.log('✓ SiteSettings');
}

async function seedThemes() {
  const themes = [
    {
      key: 'sun',
      label: 'Sun (or & cuivre, mode sombre)',
      isDefault: true,
      paletteJson: {
        bg: '#0E1626',
        bgAlt: '#1A2438',
        text: '#F2E8D5',
        textMuted: '#B8B19E',
        primary: '#C9A24B',     // gold
        secondary: '#B66B3A',   // copper
        accent: '#F2E8D5',      // cream
        border: '#3A4358',
        success: '#5FA88B',
        danger: '#C5524F',
      },
      fontDisplay: 'Playfair Display',
      fontBody: 'Inter',
    },
    {
      key: 'sun-night',
      label: 'Sun Night (full noir + or)',
      isDefault: false,
      paletteJson: {
        bg: '#000000',
        bgAlt: '#0A0A0A',
        text: '#F2E8D5',
        textMuted: '#8C8576',
        primary: '#D4AF37',
        secondary: '#8B6914',
        accent: '#FFFFFF',
        border: '#1F1F1F',
        success: '#5FA88B',
        danger: '#C5524F',
      },
      fontDisplay: 'Bodoni Moda',
      fontBody: 'Inter',
    },
  ];
  for (const t of themes) {
    await prisma.theme.upsert({ where: { key: t.key }, update: t, create: t });
  }
  console.log(`✓ Themes (${themes.length})`);
}

async function seedPartners() {
  const partners = [
    { name: 'Playsafe', url: 'https://www.playsafe.fr', category: 'prevention', orderIndex: 1 },
    { name: 'AREMEDIA', url: 'https://www.aremedia.org', category: 'prevention', orderIndex: 2 },
    { name: 'Star City', url: 'https://www.starcity.fr/', category: 'sister-venue', orderIndex: 3, logoUrl: 'http://www.starcity.fr/wp-content/uploads/sites/6/2017/11/starcity-logo.png' },
  ];
  for (const p of partners) {
    const existing = await prisma.partner.findFirst({ where: { name: p.name } });
    if (existing) {
      await prisma.partner.update({ where: { id: existing.id }, data: p });
    } else {
      await prisma.partner.create({ data: p });
    }
  }
  console.log(`✓ Partners (${partners.length})`);
}

async function seedLocations() {
  type Loc = { slug: string; orderIndex: number; iconKey: string; fr: { title: string; summary: string; contentMd: string }; en: { title: string; summary: string; contentMd: string } };
  const locations: Loc[] = [
    {
      slug: 'sauna-hammam',
      orderIndex: 1,
      iconKey: 'flame',
      fr: {
        title: 'Sauna & Hammam',
        summary: 'Sauna finlandais sec et hammam à vapeur — au cœur du sous-sol, espace détente.',
        contentMd: `Notre **sauna finlandais** monte à 90°C dans une cabine en bois clair, et notre **hammam à vapeur d'eucalyptus** vous enveloppe pour relâcher la pression.\n\n- Capacité : 12 personnes au sauna, 8 au hammam\n- Douches glacées + bain froid à proximité\n- Serviette obligatoire à l'intérieur (hygiène)\n- Pause hydratation au lounge bar tout proche`,
      },
      en: {
        title: 'Sauna & Steam Bath',
        summary: 'Finnish dry sauna and steam bath — heart of the basement relaxation area.',
        contentMd: `Our **Finnish sauna** reaches 90°C in a light-wood cabin, and our **eucalyptus steam bath** wraps you to release pressure.\n\n- Capacity: 12 in the sauna, 8 in the steam bath\n- Cold showers + cold plunge nearby\n- Towel required inside (hygiene rule)\n- Hydration break at the lounge bar next door`,
      },
    },
    {
      slug: 'piscine-jacuzzi',
      orderIndex: 2,
      iconKey: 'waves',
      fr: {
        title: 'Piscine & Jacuzzi',
        summary: 'Grande piscine intérieure chauffée + jacuzzi multi-jets.',
        contentMd: `**Douche obligatoire** avant entrée dans la piscine ou le jacuzzi (règlement sanitaire).\n\n- Piscine 12 m × 5 m, chauffée à 28°C\n- Jacuzzi 8 places, jets dorsaux et lombaires\n- Bain à remous interdit aux rapports sexuels (hygiène — exclusion immédiate)\n- Transats autour du bassin`,
      },
      en: {
        title: 'Pool & Jacuzzi',
        summary: 'Large heated indoor pool + multi-jet jacuzzi.',
        contentMd: `**Shower required** before entering the pool or jacuzzi (sanitary rule).\n\n- 12 m × 5 m heated pool (28°C)\n- 8-seat jacuzzi with back and lumbar jets\n- No sex in the jacuzzi (hygiene — immediate exclusion)\n- Loungers around the pool`,
      },
    },
    {
      slug: 'salle-de-sport',
      orderIndex: 3,
      iconKey: 'dumbbell',
      fr: {
        title: 'Salle de sport',
        summary: 'Plateau musculation + cardio, équipement pro.',
        contentMd: `**Tenue de sport obligatoire** : interdit de s'entraîner nu ou en simple serviette sur les machines.\n\n- Cage à squat, bancs, haltères jusqu'à 40 kg\n- Cardio : tapis, vélo, rameur\n- Tapis de yoga / abdos disponibles\n- Vestiaire dédié à proximité`,
      },
      en: {
        title: 'Sports Hall',
        summary: 'Weightlifting + cardio area, pro equipment.',
        contentMd: `**Sportswear mandatory**: it is forbidden to train naked or in a towel on the machines.\n\n- Squat rack, benches, dumbbells up to 40 kg\n- Cardio: treadmill, bike, rower\n- Yoga / ab mats available\n- Dedicated changing room nearby`,
      },
    },
    {
      slug: 'espace-drague',
      orderIndex: 4,
      iconKey: 'eye-off',
      fr: {
        title: 'Espace drague',
        summary: 'Cabines privées, dark room, salle vidéo — entièrement réservé aux hommes adultes.',
        contentMd: `Espace **réservé aux hommes majeurs**, pensé pour les rencontres consenties.\n\n- Cabines privées (porte fermable)\n- Dark room signalisée\n- Salle vidéo\n- Préservatifs gratuits à l'accueil et dans les zones\n- **Tolérance zéro** envers tout comportement non consenti — signaler au staff immédiatement`,
      },
      en: {
        title: 'Cruising area',
        summary: 'Private cabins, dark room, video room — strictly for adult men.',
        contentMd: `Area **reserved for adult men**, designed for consensual encounters.\n\n- Private cabins (lockable doors)\n- Signposted dark room\n- Video room\n- Free condoms at reception and in the zones\n- **Zero tolerance** for any non-consensual behaviour — report to staff immediately`,
      },
    },
    {
      slug: 'vestiaires',
      orderIndex: 5,
      iconKey: 'lock',
      fr: {
        title: 'Vestiaires',
        summary: 'Casiers à clé électronique + 2 serviettes incluses.',
        contentMd: `À l'arrivée, vous recevez **2 serviettes** et une **clé électronique** pour votre casier.\n\n- Serviette supplémentaire : 1 €\n- Effets personnels sous votre seule responsabilité\n- Tout vol ou dégradation entraîne exclusion + signalement police\n- Restitution des serviettes à la sortie`,
      },
      en: {
        title: 'Cloakrooms',
        summary: 'Electronic-key lockers + 2 towels included.',
        contentMd: `On arrival you receive **2 towels** and an **electronic key** for your locker.\n\n- Extra towel: €1\n- Personal belongings are your sole responsibility\n- Theft or damage results in exclusion + police report\n- Return towels on exit`,
      },
    },
  ];

  for (const loc of locations) {
    const created = await prisma.location.upsert({
      where: { slug: loc.slug },
      update: { orderIndex: loc.orderIndex, iconKey: loc.iconKey, active: true },
      create: { slug: loc.slug, orderIndex: loc.orderIndex, iconKey: loc.iconKey, active: true },
    });
    for (const lang of ['fr', 'en'] as const) {
      const t = loc[lang];
      await prisma.locationTranslation.upsert({
        where: { locationId_locale: { locationId: created.id, locale: lang } },
        update: { title: t.title, summary: t.summary, contentMd: t.contentMd },
        create: { locationId: created.id, locale: lang, title: t.title, summary: t.summary, contentMd: t.contentMd },
      });
    }
  }

  // V2: ajouter les covers Unsplash
  const covers: Record<string, string> = {
    'sauna-hammam':   'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=1200&auto=format&fit=crop&q=80',
    'piscine-jacuzzi':'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&auto=format&fit=crop&q=80',
    'salle-de-sport': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80',
    'espace-drague':  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=80',
    'vestiaires':     'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&auto=format&fit=crop&q=80',
  };
  for (const [slug, coverImageUrl] of Object.entries(covers)) {
    await prisma.location.update({ where: { slug }, data: { coverImageUrl } }).catch(() => null);
  }
  console.log(`✓ Locations (${locations.length}) + covers Unsplash`);
}

async function seedRecurringEvents() {
  type Rec = {
    slug: string; dayOfWeek: DayOfWeek; weekOfMonth?: WeekOfMonth;
    startTime: string; endTime?: string; priceLabel?: string; hostedBy?: string; externalUrl?: string; orderIndex: number;
    fr: { title: string; summary?: string };
    en: { title: string; summary?: string };
  };
  const recs: Rec[] = [
    {
      slug: 'lundi-18-euros', dayOfWeek: DayOfWeek.MONDAY, startTime: '12:00', endTime: '02:00',
      priceLabel: '18 €', externalUrl: 'https://www.sexygroup.fr', orderIndex: 1,
      fr: { title: 'Lundi 18 €', summary: 'Tarif unique 18 € avec inscription préalable sur sexygroup.fr.' },
      en: { title: 'Monday €18', summary: 'Flat €18 entry with prior registration on sexygroup.fr.' },
    },
    {
      slug: 'mardi-nasty-boys', dayOfWeek: DayOfWeek.TUESDAY, startTime: '12:00', endTime: '02:00',
      priceLabel: '−26 ans : 10 €', orderIndex: 2,
      fr: { title: 'Nasty Boys', summary: 'Soirée hot — tarif réduit pour les moins de 26 ans (10 € sur présentation d\'une pièce d\'identité).' },
      en: { title: 'Nasty Boys', summary: 'Hot night — €10 discount for under 26 (ID required).' },
    },
    {
      slug: 'mercredi-bollywood', dayOfWeek: DayOfWeek.WEDNESDAY, weekOfMonth: WeekOfMonth.ODD,
      startTime: '20:00', endTime: '02:00', orderIndex: 3,
      fr: { title: 'Bollywood Party', summary: 'Ambiance Bollywood les 1ᵉʳ et 3ᵉ mercredis du mois — programme détaillé sur Facebook.' },
      en: { title: 'Bollywood Party', summary: 'Bollywood vibes on the 1st and 3rd Wednesdays — full schedule on Facebook.' },
    },
    {
      slug: 'mercredi-afterwork-karaoke', dayOfWeek: DayOfWeek.WEDNESDAY, weekOfMonth: WeekOfMonth.EVEN,
      startTime: '20:00', endTime: '02:00', hostedBy: 'Kyssy Bang Bang & Cyril Kortez', orderIndex: 4,
      fr: { title: 'Afterwork Karaoké', summary: 'Karaoké hébergé par Kyssy Bang Bang & Cyril Kortez — 2ᵉ et 4ᵉ mercredis.' },
      en: { title: 'Afterwork Karaoke', summary: 'Karaoke hosted by Kyssy Bang Bang & Cyril Kortez — 2nd and 4th Wednesdays.' },
    },
    {
      slug: 'jeudi-happy-hour', dayOfWeek: DayOfWeek.THURSDAY, startTime: '18:00', endTime: '22:00',
      priceLabel: '1 bière offerte', orderIndex: 5,
      fr: { title: 'Happy Hour — Drop your towel', summary: 'Une bière offerte pour une bière commandée. Lâchez tout, laissez-vous aller.' },
      en: { title: 'Happy Hour — Drop your towel', summary: 'One free beer for one beer ordered. Drop everything, let yourself go.' },
    },
    {
      slug: 'vendredi-depistage', dayOfWeek: DayOfWeek.FRIDAY, startTime: '19:00', endTime: '23:00',
      hostedBy: 'AREMEDIA', orderIndex: 6,
      fr: { title: 'Dépistage VIH & IST', summary: 'Campagne de dépistage gratuit et anonyme avec AREMEDIA — chaque vendredi.' },
      en: { title: 'HIV & STI screening', summary: 'Free anonymous testing campaign with AREMEDIA — every Friday.' },
    },
    {
      slug: 'samedi-bears', dayOfWeek: DayOfWeek.SATURDAY, weekOfMonth: WeekOfMonth.W2,
      startTime: '12:00', endTime: '06:00', orderIndex: 7,
      fr: { title: 'Bears', summary: 'Rendez-vous des ours parisiens et internationaux dès midi — chaque 2ᵉ samedi du mois.' },
      en: { title: 'Bears', summary: 'Parisian and international bears meet from noon — every 2nd Saturday of the month.' },
    },
    {
      slug: 'dimanche-gtd', dayOfWeek: DayOfWeek.SUNDAY, startTime: '17:00', endTime: '02:00', orderIndex: 8,
      fr: { title: 'GTD — Gay Tea Dance', summary: 'Le rendez-vous du dimanche — DJ set, ambiance lounge à partir de 17h.' },
      en: { title: 'GTD — Gay Tea Dance', summary: 'The Sunday rendez-vous — DJ set, lounge vibes from 5pm.' },
    },
  ];

  for (const r of recs) {
    const created = await prisma.recurringEvent.upsert({
      where: { slug: r.slug },
      update: { dayOfWeek: r.dayOfWeek, weekOfMonth: r.weekOfMonth ?? WeekOfMonth.ALL, startTime: r.startTime, endTime: r.endTime, priceLabel: r.priceLabel, hostedBy: r.hostedBy, externalUrl: r.externalUrl, orderIndex: r.orderIndex, active: true },
      create: { slug: r.slug, dayOfWeek: r.dayOfWeek, weekOfMonth: r.weekOfMonth ?? WeekOfMonth.ALL, startTime: r.startTime, endTime: r.endTime, priceLabel: r.priceLabel, hostedBy: r.hostedBy, externalUrl: r.externalUrl, orderIndex: r.orderIndex, active: true },
    });
    for (const lang of ['fr', 'en'] as const) {
      const t = r[lang];
      await prisma.recurringEventTranslation.upsert({
        where: { recurringEventId_locale: { recurringEventId: created.id, locale: lang } },
        update: { title: t.title, summary: t.summary },
        create: { recurringEventId: created.id, locale: lang, title: t.title, summary: t.summary },
      });
    }
  }
  console.log(`✓ RecurringEvents (${recs.length})`);
}

async function seedTariffs() {
  type T = { code: string; priceCents: number; daysApplicable: DayOfWeek[]; conditionLabel?: string; orderIndex: number; fr: { label: string; details?: string }; en: { label: string; details?: string } };
  const tariffs: T[] = [
    { code: 'WEEKDAY_STD', priceCents: 2200, daysApplicable: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY], orderIndex: 1, fr: { label: 'Semaine — entrée standard', details: 'Lundi à jeudi.' }, en: { label: 'Weekday — standard entry', details: 'Monday to Thursday.' } },
    { code: 'WEEKDAY_U26', priceCents: 1400, daysApplicable: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY], conditionLabel: '−26 ans avec pièce d\'identité', orderIndex: 2, fr: { label: 'Semaine — −26 ans', details: 'Pièce d\'identité demandée.' }, en: { label: 'Weekday — under 26', details: 'ID required.' } },
    { code: 'TUE_NASTY_U26', priceCents: 1000, daysApplicable: [DayOfWeek.TUESDAY], conditionLabel: 'Mardi Nasty Boys, −26 ans', orderIndex: 3, fr: { label: 'Mardi Nasty Boys — −26 ans', details: 'Tarif spécial mardi.' }, en: { label: 'Tuesday Nasty Boys — under 26', details: 'Special Tuesday rate.' } },
    { code: 'MON_FLAT', priceCents: 1800, daysApplicable: [DayOfWeek.MONDAY], conditionLabel: 'Lundi sur inscription sexygroup.fr', orderIndex: 4, fr: { label: 'Lundi 18 €', details: 'Inscription préalable sur sexygroup.fr.' }, en: { label: 'Monday €18', details: 'Prior registration on sexygroup.fr.' } },
    { code: 'WEEKEND_STD', priceCents: 2500, daysApplicable: [DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY], orderIndex: 5, fr: { label: 'Week-end — entrée standard', details: 'Vendredi à dimanche.' }, en: { label: 'Weekend — standard entry', details: 'Friday to Sunday.' } },
    { code: 'WEEKEND_AFTER3', priceCents: 2000, daysApplicable: [DayOfWeek.FRIDAY, DayOfWeek.SATURDAY], conditionLabel: 'Après 3h du matin (vendredi/samedi)', orderIndex: 6, fr: { label: 'After — vendredi/samedi après 3h', details: 'Tarif réduit nuit profonde.' }, en: { label: 'After 3am — Fri/Sat', details: 'Late-night discount.' } },
    { code: 'WEEKEND_U26', priceCents: 1700, daysApplicable: [DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY], conditionLabel: '−26 ans avec pièce d\'identité', orderIndex: 7, fr: { label: 'Week-end — −26 ans', details: 'Pièce d\'identité demandée.' }, en: { label: 'Weekend — under 26', details: 'ID required.' } },
  ];

  for (const t of tariffs) {
    const created = await prisma.tariff.upsert({
      where: { code: t.code },
      update: { priceCents: t.priceCents, daysApplicable: t.daysApplicable, conditionLabel: t.conditionLabel, orderIndex: t.orderIndex, active: true },
      create: { code: t.code, priceCents: t.priceCents, daysApplicable: t.daysApplicable, conditionLabel: t.conditionLabel, orderIndex: t.orderIndex, active: true },
    });
    for (const lang of ['fr', 'en'] as const) {
      const tr = t[lang];
      await prisma.tariffTranslation.upsert({
        where: { tariffId_locale: { tariffId: created.id, locale: lang } },
        update: { label: tr.label, details: tr.details },
        create: { tariffId: created.id, locale: lang, label: tr.label, details: tr.details },
      });
    }
  }
  console.log(`✓ Tariffs (${tariffs.length})`);
}

async function seedProducts() {
  // 4 produits type pour la billetterie en ligne (V1.5+ une fois Stripe branché)
  type P = { slug: string; kind: ProductKind; variants: { sku: string; label: string; priceCents: number; orderIndex: number }[]; fr: { title: string; description: string }; en: { title: string; description: string } };
  const products: P[] = [
    {
      slug: 'entree-standard',
      kind: ProductKind.TICKET_DAY,
      variants: [
        { sku: 'ENT-WK-ADULT', label: 'Adulte (semaine)', priceCents: 2200, orderIndex: 1 },
        { sku: 'ENT-WE-ADULT', label: 'Adulte (week-end)', priceCents: 2500, orderIndex: 2 },
      ],
      fr: { title: 'Entrée standard', description: 'Entrée 1 jour valable selon les horaires affichés. Inclut 2 boissons + 2 serviettes + capotes.' },
      en: { title: 'Standard entry', description: '1-day entry valid during posted opening hours. Includes 2 drinks + 2 towels + condoms.' },
    },
    {
      slug: 'entree-jeune',
      kind: ProductKind.TICKET_DAY,
      variants: [
        { sku: 'ENT-WK-U26', label: '−26 ans (semaine)', priceCents: 1400, orderIndex: 1 },
        { sku: 'ENT-WE-U26', label: '−26 ans (week-end)', priceCents: 1700, orderIndex: 2 },
      ],
      fr: { title: 'Entrée −26 ans', description: 'Tarif réduit sur présentation d\'une pièce d\'identité à l\'arrivée.' },
      en: { title: 'Under-26 entry', description: 'Reduced rate — ID required on arrival.' },
    },
    {
      slug: 'pass-10-entrees',
      kind: ProductKind.PASS_MULTI,
      variants: [
        { sku: 'PASS-10', label: 'Carnet 10 entrées', priceCents: 18000, orderIndex: 1 },
      ],
      fr: { title: 'Carnet 10 entrées', description: 'Économisez sur vos visites — 10 entrées valables 12 mois, non nominatives.' },
      en: { title: '10-entry pass', description: 'Save on your visits — 10 entries valid 12 months, non-nominative.' },
    },
    {
      slug: 'abo-mensuel',
      kind: ProductKind.SUBSCRIPTION,
      variants: [
        { sku: 'ABO-M-STD', label: 'Mensuel standard', priceCents: 14900, orderIndex: 1 },
      ],
      fr: { title: 'Abonnement mensuel', description: 'Accès illimité tous les jours pendant 30 jours. Renouvellement automatique mensuel (résiliable à tout moment).' },
      en: { title: 'Monthly membership', description: 'Unlimited daily access for 30 days. Auto-renewing monthly (cancel any time).' },
    },
  ];

  for (const p of products) {
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { kind: p.kind, active: true },
      create: { slug: p.slug, kind: p.kind, active: true },
    });
    for (const lang of ['fr', 'en'] as const) {
      const tr = p[lang];
      await prisma.productTranslation.upsert({
        where: { productId_locale: { productId: created.id, locale: lang } },
        update: { title: tr.title, description: tr.description },
        create: { productId: created.id, locale: lang, title: tr.title, description: tr.description },
      });
    }
    for (const v of p.variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: { label: v.label, priceCents: v.priceCents, orderIndex: v.orderIndex, active: true, productId: created.id },
        create: { sku: v.sku, label: v.label, priceCents: v.priceCents, orderIndex: v.orderIndex, active: true, productId: created.id },
      });
    }
  }
  console.log(`✓ Products (${products.length})`);
}

async function seedPages() {
  // Pages noyau : reglement, checkin, mentions-legales, rgpd. Le contenu détaillé sera enrichi en P3.
  type Pg = { slug: string; fr: { title: string; excerpt: string; body: string }; en: { title: string; excerpt: string; body: string } };
  const pages: Pg[] = [
    {
      slug: 'reglement',
      fr: { title: 'Règlement intérieur', excerpt: 'Sun City est ouvert exclusivement aux hommes majeurs (+18 ans, pièce d\'identité demandée).', body: '## Accès\n\n- Sun City est ouvert uniquement aux **+18 ans** (pièce d\'identité demandée).\n- L\'établissement est strictement réservé aux **hommes**.\n- Notre équipe se réserve le droit de refuser l\'entrée à toute personne en état d\'ébriété ou sous influence.\n\n## Drogues\n\nL\'usage de drogues est strictement interdit. Toute personne ne respectant pas cette règle sera exclue définitivement et signalée.\n\n## Hygiène\n\n- Douche obligatoire avant la piscine ou le jacuzzi.\n- Rapports sexuels interdits dans le jacuzzi (exclusion immédiate).\n- Notre équipe peut refuser l\'accès pour raison d\'hygiène.\n\n## Salle de sport\n\nTenue de sport obligatoire. Interdit de s\'entraîner nu ou en serviette.\n\n## Respect\n\nLes propos xénophobes, racistes ou tout comportement non consenti sont strictement interdits. Tolérance zéro.' },
      en: { title: 'House rules', excerpt: 'Sun City is open exclusively to adult men (+18, ID required).', body: '## Access\n\n- Sun City is open only to **+18** (ID required).\n- The venue is strictly reserved for **men**.\n- Our team reserves the right to refuse entry to anyone intoxicated or under influence.\n\n## Drugs\n\nDrug use is strictly prohibited. Any breach results in permanent exclusion and police report.\n\n## Hygiene\n\n- Shower required before pool or jacuzzi.\n- Sex forbidden in the jacuzzi (immediate exclusion).\n- Staff may refuse entry for hygiene reasons.\n\n## Sports hall\n\nSportswear mandatory. No training naked or in a towel.\n\n## Respect\n\nXenophobic or racist remarks and any non-consensual behaviour are strictly forbidden. Zero tolerance.' },
    },
    {
      slug: 'checkin',
      fr: { title: 'Check-in', excerpt: 'Comment se déroule votre arrivée à Sun City.', body: '## À votre arrivée\n\n1. Présentez votre **pièce d\'identité** à l\'accueil (vérification d\'âge).\n2. Réglez votre entrée selon le tarif en vigueur (espèces ou CB).\n3. Recevez **2 serviettes** + une **clé électronique** pour votre casier.\n4. Le staff vous indique les vestiaires + les douches obligatoires.\n5. Profitez de l\'établissement.\n\n## À votre sortie\n\n- Restituez vos serviettes et votre clé.\n- Le staff peut vous demander de patienter brièvement aux heures de pointe.' },
      en: { title: 'Check-in', excerpt: 'How your arrival at Sun City works.', body: '## On arrival\n\n1. Show your **ID** at reception (age check).\n2. Pay the entry according to the current rate (cash or card).\n3. Receive **2 towels** + an **electronic key** for your locker.\n4. Staff will direct you to the changing room + mandatory showers.\n5. Enjoy the venue.\n\n## On exit\n\n- Return your towels and key.\n- Staff may ask you to wait briefly at peak hours.' },
    },
    {
      slug: 'mentions-legales',
      fr: { title: 'Mentions légales', excerpt: 'Éditeur, hébergement, propriété intellectuelle.', body: '## Éditeur\n\n**SARL GYM SEBASTOPOL**  \nRCS Paris : 45274626600025  \n62 boulevard de Sébastopol, 75003 Paris  \nTél : 01 40 09 26 09\n\n## Directeur de la publication\n\nLe gérant de la SARL GYM SEBASTOPOL.\n\n## Hébergement\n\n[À compléter — nom et adresse de l\'hébergeur Coolify].\n\n## Propriété intellectuelle\n\nL\'ensemble des textes, photos et vidéos publiés sur ce site est protégé par le droit d\'auteur.\n\n## Public\n\nCe site est destiné à un **public adulte (+18 ans)**. Une vérification d\'âge est demandée à l\'arrivée sur le site.' },
      en: { title: 'Legal notice', excerpt: 'Publisher, hosting, intellectual property.', body: '## Publisher\n\n**SARL GYM SEBASTOPOL**  \nRCS Paris: 45274626600025  \n62 boulevard de Sébastopol, 75003 Paris  \nPhone: +33 1 40 09 26 09\n\n## Publication director\n\nThe manager of SARL GYM SEBASTOPOL.\n\n## Hosting\n\n[To be completed — Coolify host name and address].\n\n## Intellectual property\n\nAll texts, photos and videos published on this site are protected by copyright.\n\n## Audience\n\nThis site is intended for an **adult audience (+18)**. Age verification is requested upon entry.' },
    },
    {
      slug: 'rgpd',
      fr: { title: 'Politique de confidentialité (RGPD)', excerpt: 'Quelles données nous traitons et pourquoi.', body: '## Données collectées\n\n- **Newsletter** : adresse email + langue + date d\'inscription. Conservation jusqu\'à désinscription.\n- **Contact** : nom, email, message + IP/User-Agent (fraude). Conservation 12 mois.\n- **Médias** : photos uploadées par l\'admin. Conservation jusqu\'à suppression manuelle.\n- **Authentification admin** : email + hash bcrypt + journaux de connexion (12 mois).\n\n## Vos droits\n\nAccès, rectification, suppression, portabilité, opposition. Pour exercer vos droits : contact@suncity-paris.fr.\n\n## Sous-traitants\n\n- Hébergement : Coolify (UE)\n- Email transactionnel : Resend\n- Stockage médias : MinIO self-host (UE)\n\n## Cookies\n\n- `sc_age_ok` : confirmation d\'âge 18+, durée 30 jours.\n- `next-auth.session-token` : session admin (admin uniquement).\n\nAucun cookie publicitaire ou de suivi tiers.' },
      en: { title: 'Privacy policy (GDPR)', excerpt: 'What data we process and why.', body: '## Data collected\n\n- **Newsletter**: email + locale + signup date. Kept until unsubscription.\n- **Contact**: name, email, message + IP/User-Agent (fraud). Kept 12 months.\n- **Media**: photos uploaded by admin. Kept until manual deletion.\n- **Admin auth**: email + bcrypt hash + login logs (12 months).\n\n## Your rights\n\nAccess, rectification, deletion, portability, objection. To exercise: contact@suncity-paris.fr.\n\n## Subprocessors\n\n- Hosting: Coolify (EU)\n- Transactional email: Resend\n- Media storage: MinIO self-hosted (EU)\n\n## Cookies\n\n- `sc_age_ok`: age 18+ confirmation, 30 days.\n- `next-auth.session-token`: admin session (admin only).\n\nNo advertising or third-party tracking cookies.' },
    },
  ];

  for (const p of pages) {
    for (const lang of ['fr', 'en'] as const) {
      const tr = p[lang];
      await prisma.page.upsert({
        where: { slug_locale: { slug: p.slug, locale: lang } },
        update: { title: tr.title, excerpt: tr.excerpt, contentHtml: `<div class="prose">${markdownToHtml(tr.body)}</div>`, status: PageStatus.PUBLISHED, publishedAt: new Date() },
        create: { slug: p.slug, locale: lang, title: tr.title, excerpt: tr.excerpt, contentHtml: `<div class="prose">${markdownToHtml(tr.body)}</div>`, status: PageStatus.PUBLISHED, publishedAt: new Date() },
      });
    }
  }
  console.log(`✓ Pages (${pages.length} × 2 locales)`);
}

// Mini markdown→HTML très simple pour le seed (P3 utilisera un vrai parser)
function markdownToHtml(md: string): string {
  return md
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^\*\*(.*?)\*\*/gm, '<strong>$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>\n?)+/gs, (m) => `<ul>${m}</ul>`)
    .split(/\n\n+/).map(p => p.trim().startsWith('<') ? p : `<p>${p}</p>`).join('\n');
}


async function seedBanners() {
  const banners = [
    {
      slug: 'top-soiree-du-jour',
      position: 'top',
      active: true,
      fr: { title: 'Ce soir : Mardi Nasty Boys · -26 ans : 10€', body: null, ctaLabel: null },
      en: { title: 'Tonight: Tuesday Nasty Boys · Under 26: €10', body: null, ctaLabel: null },
    },
    {
      slug: 'top-newsletter-promo',
      position: 'top',
      active: true,
      fr: { title: 'Inscris-toi à la newsletter et reçois -20% sur ta prochaine entrée', body: null, ctaLabel: 'M\'inscrire' },
      en: { title: 'Sign up to our newsletter and get -20% on your next entry', body: null, ctaLabel: 'Sign me up' },
    },
  ];
  for (const b of banners) {
    const created = await prisma.banner.upsert({
      where: { slug: b.slug },
      update: { position: b.position, active: b.active },
      create: { slug: b.slug, position: b.position, active: b.active },
    });
    for (const lang of ['fr', 'en'] as const) {
      const tr = b[lang];
      await prisma.bannerTranslation.upsert({
        where: { bannerId_locale: { bannerId: created.id, locale: lang } },
        update: tr,
        create: { bannerId: created.id, locale: lang, ...tr },
      });
    }
  }
  console.log(`✓ Banners (${banners.length})`);
}

async function main() {
  console.log('▶ Seeding Sun City Paris…');
  await seedAdmin();
  await seedSiteSettings();
  await seedThemes();
  await seedPartners();
  await seedLocations();
  await seedRecurringEvents();
  await seedTariffs();
  await seedProducts();
  await seedPages();
  await seedBanners();
  console.log('✅ Seed complet.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
