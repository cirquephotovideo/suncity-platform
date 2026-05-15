# 🔥 Sun City Paris — plateforme web

> Site officiel + back-office pour le sauna gay **Sun City Paris** (3000 m² · 62 bd de Sébastopol, 75003).
> Stack : **Next.js 14 · PostgreSQL 16 · Redis · MinIO · Prisma 5 · NextAuth · Tailwind · next-intl (FR/EN)**.
> Origine : refonte du repo `pixeeplay/godlovesdiversity` (tag d'archive : `archive/gld-source-pre-suncity`).

⚠️ **Site adulte 18+ · ouvert exclusivement aux hommes** — voir page `/reglement`.

---

## 🚀 Démarrage local

### Prérequis
- Docker Desktop (macOS/Windows) ou Docker Engine + Compose (Linux)
- Node.js 20+ et npm (uniquement pour le mode dev hot-reload)

### Option A — Tout dans Docker

```bash
cp .env.example .env          # adapter si besoin
docker compose up --build
```

Au premier boot :
- Postgres, Redis, MinIO, Mailpit démarrent
- Le bucket MinIO `suncity` est créé
- Les migrations Prisma sont appliquées
- L'admin par défaut est créé via le seed

| URL                          | Description |
|------------------------------|-------------|
| http://localhost:3000        | Site public (FR/EN) |
| http://localhost:3000/admin  | Back-office |
| http://localhost:9001        | Console MinIO (`suncityminio` / `suncityminio-secret`) |
| http://localhost:8025        | Mailpit (boîte mail de dev) |

**Identifiants admin par défaut** (à changer immédiatement en prod) :
- Email : `arnaud@gredai.com`
- Mot de passe : défini dans `.env` (`ADMIN_PASSWORD`)

### Option B — Front en hot-reload local + services Docker

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d   # DB + Redis + MinIO + Mailpit
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

---

## 🗂️ Arborescence (cible Sun City)

```
.
├── docker-compose.yml          # stack prod-like (Coolify)
├── docker-compose.dev.yml      # uniquement les services
├── docker-compose.override.yml # ports localhost en dev
├── Dockerfile                  # Next standalone multi-stage
├── .env.example                # variables d'env documentées
├── prisma/
│   ├── schema.prisma           # User, Page, Event, RecurringEvent, Location, Tariff, NewsletterSubscriber, ContactMessage, MediaAsset, SiteSettings, AuditLog
│   └── seed.ts
├── scripts/
│   ├── rebrand-suncity.sh      # purge GLD (Phase 1) — déjà exécuté
│   └── check-no-gld-residue.sh # garde-fou pre-commit/CI
├── src/
│   ├── middleware.ts           # auth + age-gate cookie check
│   ├── app/
│   │   ├── [locale]/           # FR + EN — pages publiques
│   │   │   ├── page.tsx        # Welcome
│   │   │   ├── agenda/         # soirées hebdo + à venir
│   │   │   ├── lieux/          # 5 zones du sauna
│   │   │   ├── tarifs/         # grille (à créer en P3)
│   │   │   ├── horaires-acces/ # carte + métro (à créer en P3)
│   │   │   ├── reglement/      # règles 18+ hommes only
│   │   │   ├── checkin/        # procédure d'entrée
│   │   │   ├── contact/        # formulaire Resend
│   │   │   ├── newsletter/     # double opt-in interne
│   │   │   ├── blog/           # actualités
│   │   │   ├── galerie/        # photos modérées
│   │   │   ├── partenaires/    # Playsafe, AREMEDIA, Star City
│   │   │   ├── mentions-legales/
│   │   │   └── rgpd/
│   │   ├── admin/              # back-office (CRUD pages, agenda, lieux, tarifs, médias, newsletter, settings, audit)
│   │   └── api/                # auth, newsletter, contact, storage, themes, sitemap, OG, etc.
│   ├── components/
│   ├── lib/                    # prisma, auth, mail, storage, theme, age-gate
│   ├── i18n/                   # routing & messages next-intl
│   └── messages/{fr,en}.json
└── public/
```

---

## 🔞 Age-gate & contenus adultes

- Modal 18+ obligatoire à la première visite (cookie `sc_age_ok`, durée 30 j)
- Refus → redirection vers `/sortie`
- `<meta name="rating" content="adult">` + OG images SFW (logo + adresse uniquement)
- Photos d'événements : modération admin obligatoire (`PENDING` par défaut)
- Mentions légales adulte + CGU à valider par l'avocat de la SARL GYM SEBASTOPOL

---

## 📅 Agenda hebdomadaire récurrent (seed)

| Jour | Soirée | Tarif/note |
|---|---|---|
| Lundi | « 18€ » | 18€ avec inscription externe |
| Mardi | NASTY BOYS | -26 ans : 10€ |
| Mer 1+3 | BOLLYWOOD PARTY | maj sur Facebook |
| Mer 2+4 | AFTERWORK KARAOKE | hôtes Kyssy Bang Bang & Cyril Kortez |
| Jeudi | Happy Hour | 1 bière offerte pour 1 achetée |
| Vendredi | Dépistage VIH/IST | 19h–23h, partenaire AREMEDIA |
| Samedi 2 | Bears | dès midi |
| Dimanche | GTD Gay Tea Dance | dès 17h |

---

## 🎨 Thème "Sun"

Palette par défaut (configurable dans `/admin/themes`) :
- `--sun-gold #C9A24B`
- `--sun-copper #B66B3A`
- `--sun-night #0E1626`
- `--sun-cream #F2E8D5`

Typo : Display `Bodoni Moda` ou `Playfair Display`, body `Inter`. Mode sombre par défaut.

---

## 💌 Newsletter

- Double opt-in RGPD
- Confirmation par email (Mailpit en dev, Resend en prod)
- Désinscription en 1 clic via token dédié
- Notification automatique de l'admin à chaque inscription
- Éditeur HTML simple dans `/admin/newsletter`

---

## 🚢 Déploiement Coolify

1. Push ce repo sur GitHub :
   ```bash
   git init && git add . && git commit -m "feat: suncity-platform initial release"
   git branch -M main
   git remote add origin git@github.com:<GITHUB_REPO>.git
   git push -u origin main
   ```

2. Dans Coolify → **+ New Resource → Docker Compose**
   - Source : ton repo GitHub
   - Branch : `main`
   - Compose file : `docker-compose.yml`
   - Domaine : `<DOMAIN>` (staging d'abord, ex `sun.<staging-domain>`)

3. Variables d'env à définir dans Coolify (copier depuis `.env.example`).
   Secrets indispensables : `NEXTAUTH_SECRET`, `RESEND_API_KEY`, `ADMIN_PASSWORD`, `MINIO_ROOT_PASSWORD`, optionnel `GEMINI_API_KEY`.

4. **Deploy**. Coolify build le Dockerfile, applique les migrations Prisma au boot, expose le service via `SERVICE_FQDN_WEB_3000`.

5. Backup Postgres : Coolify → Database → Backups → Daily ON.

6. Cutover domaine final `suncity-paris.fr` quand QA verte (DNS + cert Let's Encrypt + 301 mapping vieux slugs WordPress).

---

## 🛡️ Garde-fous

- `scripts/check-no-gld-residue.sh` — exécuter avant chaque PR pour vérifier qu'aucun résidu GLD/Connect/Identités/multi-domain ne réapparaît
- TypeScript strict (le `ignoreBuildErrors: true` de l'origine sera retiré en P7)
- Toutes les actions admin journalisées dans `AuditLog`

---

## 📞 Support

- Adresse : 62 boulevard de Sébastopol, 75003 Paris
- Téléphone : 01 40 09 26 09
- Société éditrice : SARL GYM SEBASTOPOL — RCS 45274626600025
- Email admin : `arnaud@gredai.com`

---

## 📊 Origine

Refonte du projet **God Loves Diversity** (`pixeeplay/godlovesdiversity@b421449`).

Tag d'archive de la source pré-purge : `archive/gld-source-pre-suncity`.

Voir `PLAN_SUNCITY_2026.md` (à la racine du dossier de travail) pour le plan complet par phases.
