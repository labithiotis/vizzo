import { Link } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { ExampleGallery } from './ExampleGallery';
import { FeatureList } from './FeatureList';
import { HomeHero } from './HomeHero';

export function LandingPage() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const page = root.current;
    if (!page) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const styles = getComputedStyle(page);
    const easing = styles.getPropertyValue('--ease-out').trim();
    const duration = Number.parseFloat(styles.getPropertyValue('--motion-standard'));
    const introEndsAt = performance.now() + Number.parseFloat(styles.getPropertyValue('--motion-enter'));
    const animations: Animation[] = [];
    function reveal(element: Element) {
      if (element.contains(document.activeElement)) return;
      const reduced = reducedMotion.matches;
      const frames = reduced
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ];
      const delay = reduced
        ? 0
        : Number(element.getAttribute('data-reveal-delay') || 0) + Math.max(0, introEndsAt - performance.now());
      animations.push(
        element.animate(frames, { duration: reduced ? 100 : duration, delay, easing, fill: 'backwards' }),
      );
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target;
          reveal(element);
          observer.unobserve(element);
        }
      },
      { threshold: 0.08 },
    );
    for (const element of page.querySelectorAll('[data-reveal]')) observer.observe(element);

    const image = page.querySelector('.landing-chart-image img');
    function revealImage() {
      const chart = page?.querySelector('.landing-chart-image');
      if (!chart) return;
      animations.push(
        chart.animate(
          reducedMotion.matches
            ? [{ opacity: 0 }, { opacity: 1 }]
            : [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
          { duration: reducedMotion.matches ? 200 : 600, delay: reducedMotion.matches ? 0 : 250, easing },
        ),
      );
    }
    if (image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0) revealImage();
    else image?.addEventListener('load', revealImage, { once: true });

    function cancelMotion() {
      if (reducedMotion.matches) for (const animation of animations) animation.cancel();
    }
    function focus(event: FocusEvent) {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest('.vizzo-rise, [data-reveal]') || event.target;
      for (const animation of target.getAnimations()) animation.cancel();
    }
    reducedMotion.addEventListener('change', cancelMotion);
    page.addEventListener('focusin', focus);
    return () => {
      observer.disconnect();
      image?.removeEventListener('load', revealImage);
      reducedMotion.removeEventListener('change', cancelMotion);
      page.removeEventListener('focusin', focus);
      for (const animation of animations) animation.cancel();
    };
  }, []);

  return (
    <main ref={root}>
      <HomeHero />
      <section className="mx-auto max-w-6xl border-grid p-6 dark:border-grid-dark">
        <h2
          data-reveal
          className="font-mono-display text-ink/50 text-xs uppercase tracking-widest dark:text-ink-dark/50"
        >
          What you get
        </h2>
        <div className="mt-6 max-w-3xl">
          <FeatureList />
        </div>
      </section>
      <section className="mx-auto max-w-6xl border-grid p-6 dark:border-grid-dark">
        <div data-reveal className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-mono-display text-ink/50 text-xs uppercase tracking-widest dark:text-ink-dark/50">
            Examples
          </h2>
          <Link
            to="/docs/$page"
            params={{ page: 'examples' }}
            className="landing-control inline-flex items-center gap-2 font-mono-display text-plotter-blue text-xs hover:underline"
          >
            Browse chart gallery{' '}
            <span aria-hidden="true" className="landing-arrow">
              →
            </span>
          </Link>
        </div>
        <p data-reveal data-reveal-delay="70" className="mt-3 text-ink/60 text-sm dark:text-ink-dark/60">
          Every chart on this site is rendered by the Vizzo API.
        </p>
        <div className="mt-6">
          <ExampleGallery />
        </div>
      </section>
      <footer
        data-reveal
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 border-grid p-6 dark:border-grid-dark"
      >
        <nav aria-label="Documentation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link to="/docs" className="landing-control inline-block text-plotter-blue hover:underline">
            Quick start
          </Link>
          <Link
            to="/docs/$page"
            params={{ page: 'http' }}
            className="landing-control inline-block text-plotter-blue hover:underline"
          >
            URL & API
          </Link>
          <Link
            to="/docs/$page"
            params={{ page: 'cli' }}
            className="landing-control inline-block text-plotter-blue hover:underline"
          >
            CLI guide
          </Link>
        </nav>
        <p className="font-mono-display text-ink/50 text-xs dark:text-ink-dark/50">
          MIT licensed.{' '}
          <a
            href="https://github.com/labithiotis/vizzo"
            className="landing-control inline-block text-plotter-blue underline underline-offset-4"
          >
            GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}
