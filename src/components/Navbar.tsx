import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 5.2 L18.9 9.1 L18.9 14.9 L12 18.8 L5.1 14.9 L5.1 9.1 Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-colors",
        scrolled ? "bg-ink/70 backdrop-blur-xl border-b border-line" : "bg-transparent",
      ].join(" ")}
    >
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-display font-semibold tracking-[0.14em] uppercase">
            <span className="w-8 h-8 text-gold grid place-items-center">
              <Mark className="w-8 h-8" />
            </span>
            <span className="text-[18px] text-bone">Lumora</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/studio" className="btn-primary btn-sm">
              Open the studio
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
