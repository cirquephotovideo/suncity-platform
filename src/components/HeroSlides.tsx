import { Link } from '@/i18n/routing';
import { ChevronDown } from 'lucide-react';

interface Slide {
  eyebrow: string;
  title: string;
  body: string;
  ctas?: { label: string; href: string }[];
  videoUrl?: string;
  imageUrl?: string;
}

export function HeroSlides({ slides }: { slides: Slide[] }) {
  return (
    <div className="snap-y snap-mandatory overflow-y-auto h-screen">
      {slides.map((s, i) => (
        <section key={i} className="snap-start h-screen w-full relative flex items-center justify-center text-center overflow-hidden">
          {s.videoUrl && (
            <video
              src={s.videoUrl}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
              autoPlay muted loop playsInline
              poster={s.imageUrl}
            />
          )}
          {!s.videoUrl && s.imageUrl && (
            <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${s.imageUrl})` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/60 to-bg" />
          <div className="relative z-10 max-w-4xl px-6">
            <p className="eyebrow mb-4">{s.eyebrow}</p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl mb-6 leading-[0.95] tracking-tight">{s.title}</h1>
            <p className="text-lg md:text-xl text-textMuted max-w-2xl mx-auto mb-8">{s.body}</p>
            {s.ctas && (
              <div className="flex flex-wrap gap-3 justify-center">
                {s.ctas.map((c, j) => (
                  <Link key={j} href={c.href as any} className={j === 0 ? 'btn-primary' : 'btn-outline'}>
                    {c.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {i < slides.length - 1 && (
            <ChevronDown className="absolute bottom-6 left-1/2 -translate-x-1/2 w-6 h-6 text-primary animate-bounce" />
          )}
        </section>
      ))}
    </div>
  );
}
