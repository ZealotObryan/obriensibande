const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Mobile navigation ---------- */
const button = document.querySelector('.menu');
const nav = document.querySelector('#links');

if (button && nav) {
  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
  };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      button.focus();
    }
  });
}

/* ---------- Footer year ---------- */
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

/* ---------- Header shadow + scroll progress bar ---------- */
const header = document.querySelector('header');
const bar = document.createElement('div');
bar.className = 'progress';
bar.setAttribute('aria-hidden', 'true');
document.body.prepend(bar);

let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
    ticking = false;
  });
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Ticker: duplicate content for a seamless marquee ---------- */
const ticker = document.querySelector('.ticker');
if (ticker && !reduceMotion) {
  const track = document.createElement('div');
  track.className = 'track';
  track.innerHTML = ticker.innerHTML;
  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  ticker.textContent = '';
  ticker.append(track, clone);
  // the two tracks sit side by side; animate both as one strip
  ticker.style.display = 'flex';
  ticker.style.whiteSpace = 'nowrap';
  ticker.querySelectorAll('.track').forEach((t) => (t.style.paddingRight = '25px'));
}

/* ---------- Scroll reveal ---------- */
if ('IntersectionObserver' in window && !reduceMotion) {
  const targets = document.querySelectorAll(
    '.section .eyebrow, .section h2, .lead, .two > div > *, .cards article, .facts li, .project, .muted, .contact-card, .prose > *, .art'
  );
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // stagger siblings (cards, stats) slightly
    const idx = [...(el.parentElement ? el.parentElement.children : [])].indexOf(el);
    if (el.matches('.cards article, .facts li')) el.style.setProperty('--d', `${idx * 0.09}s`);
    io.observe(el);
  });
}

/* ---------- Active nav link while scrolling (homepage) ---------- */
const links = [...document.querySelectorAll('#links a[href*="#"]')];
const map = new Map();
links.forEach((a) => {
  const id = a.getAttribute('href').split('#')[1];
  const sec = id && document.getElementById(id);
  if (sec) map.set(sec, a);
});
if (map.size && 'IntersectionObserver' in window && location.pathname.replace(/\/$/, '') === '' ) {
  const spy = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((l) => l.classList.remove('active'));
        map.get(e.target).classList.add('active');
      }
    }),
    { rootMargin: '-45% 0px -50% 0px' }
  );
  map.forEach((_, sec) => spy.observe(sec));
}
