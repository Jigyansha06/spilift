/* ============================================
   SPILIFT — Strategic PR & Digital Growth
   PREMIUM 3D Website JavaScript v2.0
   Ultra-smooth scrolling · Advanced 3D · Micro-interactions
   ============================================ */

// === Press Releases Data ===
// Each entry now carries a title, publication name, and optional cover
// thumbnail — set 'cover' to an image path (e.g. "assets/campaigns/xyz.jpg")
// to replace the placeholder with a real image. The 'url' fields below are
// unchanged from before.
const PRESS_RELEASES = {
    group: [
        { title: "The PR House Presents: Mentors of Impact — India's Top Coaches 2026", publication: "Ahmedabad Mirror", cover: "mentors-of-impact.jpeg", url: "https://www.ahmedabadmirror.com/the-pr-house-presents-mentors-of-impact-indias-top-coaches-2026/81906408.html" },
        { title: "10 Inspiring Women Personalities to Watch Out for This Women's Day", publication: "Mid-Day", cover: "inspiring-women-2026.jpeg", url: "https://www.mid-day.com/buzzfeed/article/10-inspiring-women-personalities-to-watch-out-for-this-women-s-day-2026-9127#google_vignette" },
        { title: "Top Astrologers and Tarot Card Readers to Watch Out in 2026", publication: "Ahmedabad Mirror", cover: "top-astrologers-tarot-readers.jpeg", url: "https://ahmedabadmirror.com/top-astrologers-and-tarot-card-readers-to-watch-out-in-2026/81917183.html" },
        { title: "9 Must-Read Books in 2026", publication: "Mid-Day", cover: "must-read-books-2026.jpeg", url: "https://www.mid-day.com/amp/buzz/article/9-must-read-books-of-2026-9597" }

    ],
    solo: [
        { title: "Sayantani Putatunda: The Author With Beauty, Brains and a Hammer", publication: "Ahmedabad Mirror", cover: "sayantani-putatunda.jpeg", url: "https://www.ahmedabadmirror.com/sayantani-putatunda-the-author-with-beauty-brains-and-a-hammer/81892411.html#goog_rewarded" },
        { title: "Pooja Jaisingh: The Visionary Bridging Luxury, Influence & Global Brand Narratives", publication: "Mid-Day", cover: "pooja-jaisingh.jpeg", url: "https://www.mid-day.com/buzzfeed/article/pooja-jaisingh-the-visionary-bridging-luxury-influence-and-global-brand-narratives-9932" },
        { title: "Dr. Shivani Mayekar Rao: Crafting Smiles, Empowering Lives", publication: "Mid-Day", cover: "dr-shivani-mayekar-rao.jpeg", url: "https://www.mid-day.com/buzz/article/dr-shivani-mayekar-rao-crafting-smiles-empowering-lives-8577" }
        
    ]
};

// === Magazines Data ===
// Replace cover and link with the real image path/URL when available.
// 'instagram' is optional — set it to the magazine's Instagram profile URL
// to show a small Instagram icon next to "View Magazine".
const MAGAZINES = [
    {
        title: "GLORIOUS INDIA MAGAZINE",
        cover: "cover page.webp",
        link: "https://gloriousindiamagazine.in/",
        instagram: "https://www.instagram.com/__gloriousindiamagazine__?igsi=ZHUyeXFtcWVpeDNu"
    }
];

// === Render Press Releases ===
function renderPressReleases() {
    const isPlaceholder = (url) => !url || url === 'PASTE_LINK_HERE' || url === '#';

    function renderList(containerId, items) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!items || items.length === 0) {
            container.innerHTML = '<p class="press-empty">Campaigns coming soon.</p>';
            return;
        }

        container.innerHTML = items.map((item, i) => {
            const num = String(i + 1).padStart(2, '0');
            const placeholder = isPlaceholder(item.url);
            const href = placeholder ? '#' : item.url;
            const disabledAttrs = placeholder
                ? ' aria-disabled="true" tabindex="-1" onclick="return false;"'
                : ' target="_blank" rel="noopener noreferrer"';
            const hasCover = item.cover && item.cover !== 'PASTE_COVER_HERE';
            const thumbInner = hasCover
                ? `<img src="${item.cover}" alt="${item.title}" loading="lazy">`
                : `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>${item.publication || 'SPILIFT'}</span>`;
            return `
                <a class="press-row" href="${href}"${disabledAttrs} aria-label="${item.title}">
                    <div class="press-row-thumb${hasCover ? '' : ' placeholder'}">
                        ${thumbInner}
                        <span class="press-row-num">${num}</span>
                    </div>
                    <div class="press-row-body">
                        ${item.publication ? `<span class="press-row-pub">${item.publication}</span>` : ''}
                        <span class="press-row-label">${item.title}</span>
                        <span class="press-row-cta">View Campaign
                            <svg class="press-row-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </span>
                    </div>
                </a>`;
        }).join('');
    }

    renderList('groupCampaignsList', PRESS_RELEASES.group);
    renderList('soloCampaignsList', PRESS_RELEASES.solo);

    // Tab switching
    const tabs = document.querySelectorAll('.press-tab');
    const panels = document.querySelectorAll('.press-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            tabs.forEach(t => {
                const isActive = t === tab;
                t.classList.toggle('active', isActive);
                t.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
            panels.forEach(p => p.classList.toggle('active', p.dataset.panel === target));
        });
    });
}

// === Render Magazines ===
function renderMagazines() {
    const container = document.getElementById('magazinesList');
    if (!container || !MAGAZINES.length) return;

    container.innerHTML = MAGAZINES.map(mag => {
        const hasCover = mag.cover && mag.cover !== 'PASTE_COVER_HERE';
        const hasLink = mag.link && mag.link !== 'PASTE_LINK_HERE';
        const coverHtml = hasCover
            ? `<img src="${mag.cover}" alt="${mag.title} cover" loading="lazy">`
            : `<div class="magazine-cover-placeholder">Cover coming soon</div>`;
        const linkAttrs = hasLink
            ? `href="${mag.link}" target="_blank" rel="noopener noreferrer"`
            : `href="#" aria-disabled="true" tabindex="-1" onclick="return false;"`;
        const hasInstagram = mag.instagram && mag.instagram !== 'PASTE_INSTAGRAM_HERE';
        const instagramHtml = hasInstagram
            ? `<a class="magazine-instagram" href="${mag.instagram}" target="_blank" rel="noopener noreferrer" aria-label="${mag.title} on Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
               </a>`
            : '';

        return `
            <div class="magazine-card">
                <div class="magazine-cover">${coverHtml}</div>
                <div class="magazine-info">
                    <h3 class="magazine-title">${mag.title}</h3>
                    <p class="magazine-desc">Explore our latest issue, featuring insights and stories from the SPILIFT team.</p>
                    <div class="magazine-actions">
                        <a class="btn btn-primary btn-3d" ${linkAttrs}>
                            <span>View Magazine</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </a>
                        ${instagramHtml}
                    </div>
                </div>
            </div>`;
    }).join('');
}

// === Ultra-Smooth Scroll Engine (Lenis) ===
let lenisInstance = null;

function initSmoothScroll() {
    // Only enable on desktop and non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (window.innerWidth <= 768 || isTouchDevice) {
        document.documentElement.classList.remove('lenis', 'lenis-smooth');
        return;
    }

    document.documentElement.classList.add('lenis', 'lenis-smooth');

    // Initialize Lenis from CDN
    if (typeof Lenis !== 'undefined') {
        lenisInstance = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 0.95,
            smoothTouch: false,
            touchMultiplier: 1.5,
            infinite: false,
        });

        function raf(time) {
            if (lenisInstance) {
                lenisInstance.raf(time);
                requestAnimationFrame(raf);
            }
        }

        requestAnimationFrame(raf);
    }
}


// === Preloader ===
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loading');

    const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Loader display time
    const minDisplay = prefersReducedMotion ? 500 : 900;

    const startTime = Date.now();

    const hidePreloader = () => {
        const preloader = document.getElementById('preloader');

        if (!preloader || preloader.classList.contains('hidden')) return;

        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplay - elapsed);

        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.classList.remove('loading');
            initAnimations();
        }, remaining);
    };

    // Hide after page is loaded
    window.addEventListener('load', hidePreloader);

    // Safety fallback
    setTimeout(hidePreloader, 5000);
});

// === Advanced Particle System (3D depth) ===
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const isMobile = window.innerWidth <= 768;
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 2);
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);
    
    const particles = [];
    // Reduce particles heavily on mobile for performance
    const particleCount = isMobile 
        ? Math.min(20, Math.floor(width / 25)) 
        : Math.min(80, Math.floor(width / 20));
    const mouse = { x: width / 2, y: height / 2, active: false };
    let frame = 0;
    let lastTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.z = Math.random() * 800 + 100;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.vz = (Math.random() - 0.5) * 0.2;
            this.baseRadius = Math.random() * 2.5 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.hue = Math.random() > 0.7 ? 25 : 15; // orange tones
            this.pulse = Math.random() * Math.PI * 2;
            this.pulseSpeed = Math.random() * 0.02 + 0.01;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.z += this.vz;
            this.pulse += this.pulseSpeed;

            // Mouse interaction — smooth repulsion/attraction (skip on mobile)
            if (!isMobile && mouse.active) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 200) {
                    const force = (200 - dist) / 200 * 0.008;
                    this.vx += dx * force;
                    this.vy += dy * force;
                }
            }

            // Damping
            this.vx *= 0.995;
            this.vy *= 0.995;

            // Parallax to mouse (skip on mobile)
            if (!isMobile) {
                const dx = mouse.x - width / 2;
                const dy = mouse.y - height / 2;
                this.x += dx * 0.00008 * (800 / this.z);
                this.y += dy * 0.00008 * (800 / this.z);
            }

            if (this.x < -60 || this.x > width + 60 || 
                this.y < -60 || this.y > height + 60 ||
                this.z < 50 || this.z > 900) {
                this.reset();
            }
        }

        draw() {
            const scale = 600 / this.z;
            const sx = (this.x - width / 2) * scale + width / 2;
            const sy = (this.y - height / 2) * scale + height / 2;
            const r = this.baseRadius * scale * (1 + Math.sin(this.pulse) * 0.15);
            const alpha = this.opacity * (1 - this.z / 900) * (0.8 + Math.sin(this.pulse) * 0.2);

            if (sx < -20 || sx > width + 20 || sy < -20 || sy > height + 20) return;

            if (!isMobile) {
                // Outer glow (skip on mobile for performance)
                const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 4);
                gradient.addColorStop(0, `hsla(${this.hue}, 100%, 60%, ${alpha * 0.3})`);
                gradient.addColorStop(0.5, `hsla(${this.hue}, 100%, 55%, ${alpha * 0.08})`);
                gradient.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);
                ctx.beginPath();
                ctx.arc(sx, sy, r * 4, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            // Core dot
            ctx.beginPath();
            ctx.arc(sx, sy, Math.max(r, 0.5), 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 65%, ${alpha})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Skip connection lines entirely on mobile (O(n²) is the main lag source)
    function connectParticles() {
        if (isMobile) return;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const scaleA = 600 / a.z;
                const scaleB = 600 / b.z;
                const ax = (a.x - width / 2) * scaleA + width / 2;
                const ay = (a.y - height / 2) * scaleA + height / 2;
                const bx = (b.x - width / 2) * scaleB + width / 2;
                const by = (b.y - height / 2) * scaleB + height / 2;
                const dist = Math.hypot(ax - bx, ay - by);

                if (dist < 130) {
                    const avgAlpha = ((a.opacity + b.opacity) / 2) * (1 - dist / 130) * 0.15;
                    const gradient = ctx.createLinearGradient(ax, ay, bx, by);
                    gradient.addColorStop(0, `hsla(25, 100%, 60%, ${avgAlpha})`);
                    gradient.addColorStop(1, `hsla(25, 100%, 60%, ${avgAlpha * 0.5})`);
                    ctx.beginPath();
                    ctx.moveTo(ax, ay);
                    ctx.lineTo(bx, by);
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    function animate(currentTime) {
        // Throttle to target FPS on mobile
        if (isMobile) {
            const elapsed = currentTime - lastTime;
            if (elapsed < frameInterval) {
                requestAnimationFrame(animate);
                return;
            }
            lastTime = currentTime - (elapsed % frameInterval);
        }

        ctx.clearRect(0, 0, width, height);
        frame++;
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        if (frame % 2 === 0) { // Optimize connection drawing
            connectParticles();
        }
        
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    if (!isMobile) {
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        });

        window.addEventListener('mouseleave', () => {
            mouse.active = false;
        });
    }

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 2);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);
    });
}

// === Navigation ===
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        updateActiveNav();
    });

    // Hamburger toggle
    hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('active');
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    function updateActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 250;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = (navbar ? navbar.offsetHeight : 80) + 10;
                
                if (lenisInstance) {
                    lenisInstance.scrollTo(target, {
                        offset: -offset,
                        duration: 1.5,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                    });
                } else {
                    const targetPos = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({
                        top: targetPos,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// === Scroll Animations — Ultra Smooth ===
function initAnimations() {
    const elements = document.querySelectorAll('[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseInt(el.dataset.delay) || 0;
                
                setTimeout(() => {
                    el.classList.add('animated');
                }, delay);
                
                observer.unobserve(el);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// === Counter Animation — Smooth easing ===
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                const suffix = el.dataset.suffix || '';
                
                animateCounter(el, target, suffix);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.4 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el, target, suffix) {
    const duration = 2500;
    const startTime = performance.now();

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutExpo(progress);
        const current = Math.round(target * eased);
        
        el.textContent = current.toLocaleString() + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// === Testimonials Carousel — Ultra Smooth ===
function initCarousel() {
    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('carouselDots');
    const carousel = track ? track.parentElement : null;
    
    if (!track || !prevBtn || !nextBtn || !dotsContainer || !carousel) return;

    const cards = track.querySelectorAll('.testimonial-card');
    const GAP = 24;
    let currentIndex = 0;
    let cardsPerView = getCardsPerView();
    let maxIndex = Math.max(0, cards.length - cardsPerView);
    let autoplayInterval;
    let isAnimating = false;

    function getCardsPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    // Calculate and set card widths from the carousel container
    function sizeCards() {
        const containerWidth = carousel.offsetWidth;
        const cpv = getCardsPerView();
        const totalGap = (cpv - 1) * GAP;
        const cardWidth = Math.floor((containerWidth - totalGap) / cpv);

        cards.forEach(card => {
            card.style.width = cardWidth + 'px';
        });

        return cardWidth;
    }

    function createDots() {
        dotsContainer.innerHTML = '';
        const dotCount = maxIndex + 1;
        for (let i = 0; i < dotCount; i++) {
            const dot = document.createElement('div');
            dot.className = `carousel-dot${i === currentIndex ? ' active' : ''}`;
            dot.addEventListener('click', () => { goTo(i); resetAutoplay(); });
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function goTo(index) {
        if (isAnimating) return;
        isAnimating = true;
        
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        const cardWidth = sizeCards();
        const offset = currentIndex * (cardWidth + GAP);
        track.style.transform = `translateX(-${offset}px)`;
        updateDots();
        
        setTimeout(() => { isAnimating = false; }, 800);
    }

    function next() {
        goTo(currentIndex >= maxIndex ? 0 : currentIndex + 1);
    }

    function prev() {
        goTo(currentIndex <= 0 ? maxIndex : currentIndex - 1);
    }

    prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });
    nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });

    function startAutoplay() {
        autoplayInterval = setInterval(next, 6000);
    }

    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }

    // Touch/swipe
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) next();
            else prev();
            resetAutoplay();
        }
    }, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            cardsPerView = getCardsPerView();
            maxIndex = Math.max(0, cards.length - cardsPerView);
            if (currentIndex > maxIndex) currentIndex = maxIndex;
            createDots();
            goTo(currentIndex);
        }, 150);
    });

    // Initial sizing & dots
    sizeCards();
    createDots();
    startAutoplay();
}

// === Premium 3D Tilt Effect ===
function initTiltEffect() {
    if (window.innerWidth <= 768) return;
    const tiltElements = document.querySelectorAll('.stat-3d-wrap, .why-card-3d, .case-card-3d, .testimonial-3d, .form-3d, .press-row');
    
    tiltElements.forEach(el => {
        let currentRotateX = 0;
        let currentRotateY = 0;
        let targetRotateX = 0;
        let targetRotateY = 0;
        let rafId = null;
        let isHovered = false;

        function smoothTilt() {
            currentRotateX += (targetRotateX - currentRotateX) * 0.08;
            currentRotateY += (targetRotateY - currentRotateY) * 0.08;

            const translateZ = isHovered ? 12 : 0;
            el.style.transform = `perspective(${1400}px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) translateZ(${translateZ}px)`;

            if (Math.abs(targetRotateX - currentRotateX) > 0.01 || 
                Math.abs(targetRotateY - currentRotateY) > 0.01) {
                rafId = requestAnimationFrame(smoothTilt);
            } else {
                rafId = null;
            }
        }

        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            targetRotateX = ((y - centerY) / centerY) * -8;
            targetRotateY = ((x - centerX) / centerX) * 8;
            isHovered = true;

            if (!rafId) {
                rafId = requestAnimationFrame(smoothTilt);
            }
        });

        el.addEventListener('mouseleave', () => {
            targetRotateX = 0;
            targetRotateY = 0;
            isHovered = false;

            if (!rafId) {
                rafId = requestAnimationFrame(smoothTilt);
            }
        });
    });
}

// === Hero 3D Mouse Follow — Ultra Smooth ===
function initHero3D() {
    if (window.innerWidth <= 768) return;
    const heroVisual = document.querySelector('.hero-visual');
    const cardInner = document.querySelector('.card-3d-inner');
    
    if (!heroVisual || !cardInner) return;

    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;
    let rafId = null;
    let isHovered = false;

    function animate() {
        currentX += (targetX - currentX) * 0.06;
        currentY += (targetY - currentY) * 0.06;

        if (isHovered) {
            cardInner.style.animation = 'none';
            cardInner.style.transform = `rotateY(${currentX * 25}deg) rotateX(${-currentY * 25}deg)`;
        }

        if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
            rafId = requestAnimationFrame(animate);
        } else {
            rafId = null;
        }
    }

    heroVisual.addEventListener('mousemove', (e) => {
        const rect = heroVisual.getBoundingClientRect();
        targetX = (e.clientX - rect.left) / rect.width - 0.5;
        targetY = (e.clientY - rect.top) / rect.height - 0.5;
        isHovered = true;

        if (!rafId) {
            rafId = requestAnimationFrame(animate);
        }
    });

    heroVisual.addEventListener('mouseleave', () => {
        isHovered = false;
        targetX = 0;
        targetY = 0;
        
        // Smooth return
        const returnAnim = () => {
            currentX += (0 - currentX) * 0.04;
            currentY += (0 - currentY) * 0.04;
            cardInner.style.transform = `rotateY(${currentX * 25}deg) rotateX(${-currentY * 25}deg)`;
            
            if (Math.abs(currentX) > 0.002 || Math.abs(currentY) > 0.002) {
                requestAnimationFrame(returnAnim);
            } else {
                currentX = 0;
                currentY = 0;
                cardInner.style.transform = '';
                cardInner.style.animation = 'heroFloat 8s var(--ease-smooth) infinite';
            }
        };
        requestAnimationFrame(returnAnim);
    });
}

// === Form Handling ===
function initForm() {
    const form = document.getElementById('consultationForm');
    const submitBtn = document.getElementById('submitBtn');
    const modal = document.getElementById('successModal');
    
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btnSpan = submitBtn.querySelector('span');
        const originalText = btnSpan.textContent;
        btnSpan.textContent = 'Sending...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.style.transform = 'scale(0.98)';

        const formData = {
            Name: form.name.value,
            Email: form.email.value,
            Phone: form.phone.value,
            Service: form.service.value,
            Message: form.message.value
        };

        fetch("/api/submit", {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            btnSpan.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.transform = '';
            
            modal.classList.add('active');
            form.reset();

            // Remove focused class from inputs on form reset
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.parentElement.classList.remove('focused');
            });

            setTimeout(() => {
                modal.classList.remove('active');
            }, 5000);
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            btnSpan.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.transform = '';
            alert("Oops! There was a problem submitting your form. Please try again or email us directly at spiliftmedia@gmail.com.");
        });
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Premium focus animation
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
    });
}

// === Back to Top ===
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 600) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// === WhatsApp Button ===
function initWhatsApp() {
    const btn = document.getElementById('whatsappBtn');
    if (!btn) return;
    
    btn.style.opacity = '0';
    btn.style.transform = 'scale(0) rotate(-180deg)';
    
    setTimeout(() => {
        btn.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1) rotate(0deg)';
    }, 3500);
}

// === Magnetic Button Effect — Ultra Smooth ===
function initMagneticButtons() {
    if (window.innerWidth <= 768) return;
    const buttons = document.querySelectorAll('.btn, .nav-cta, .social-link, .carousel-btn');
    
    buttons.forEach(btn => {
        let currentX = 0, currentY = 0;
        let targetX = 0, targetY = 0;
        let rafId = null;

        function animate() {
            currentX += (targetX - currentX) * 0.12;
            currentY += (targetY - currentY) * 0.12;
            
            btn.style.transform = `translate(${currentX}px, ${currentY}px)`;

            if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
                rafId = requestAnimationFrame(animate);
            } else {
                rafId = null;
                btn.style.transform = '';
            }
        }

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            // 0.28 factor for small and medium buttons gives a nice snappy response
            targetX = (e.clientX - rect.left - rect.width / 2) * 0.28;
            targetY = (e.clientY - rect.top - rect.height / 2) * 0.28;

            if (!rafId) {
                rafId = requestAnimationFrame(animate);
            }
        });

        btn.addEventListener('mouseleave', () => {
            targetX = 0;
            targetY = 0;

            if (!rafId) {
                rafId = requestAnimationFrame(animate);
            }
        });
    });
}

// === Ripple Effect ===
function initRipple() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.left = (e.clientX - rect.left) + 'px';
            ripple.style.top = (e.clientY - rect.top) + 'px';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 700);
        });
    });

    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            .ripple-effect {
                position: absolute;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0));
                transform: translate(-50%, -50%);
                animation: rippleAnim 0.7s cubic-bezier(0.16, 1, 0.3, 1);
                pointer-events: none;
            }
            @keyframes rippleAnim {
                to {
                    width: 400px;
                    height: 400px;
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// === Parallax Scroll Elements ===
function initParallax() {
    if (window.innerWidth <= 768) return;
    const shapes = document.querySelectorAll('.hero-shape');
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                
                shapes.forEach((shape, i) => {
                    const speed = (i + 1) * 0.04;
                    shape.style.transform = `translateY(${scrolled * speed}px)`;
                });
                
                ticking = false;
            });
            ticking = true;
        }
    });
}

// === Cursor Glow Effect — Premium Interactive ===
function initCursorGlow() {
    if (window.innerWidth <= 768) return;
    
    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    glow.style.cssText = `
        position: fixed;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 107, 53, 0.04), transparent 60%);
        pointer-events: none;
        z-index: 1;
        transform: translate(-50%, -50%);
        transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1), 
                    height 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                    background 0.4s ease;
        will-change: transform, width, height;
    `;
    document.body.appendChild(glow);

    let curX = 0, curY = 0;
    let glowX = 0, glowY = 0;
    let isHoveringInteractive = false;

    const interactiveSelectors = '.btn, .nav-link, .nav-cta, .social-link, .footer-socials a, .carousel-btn, .hamburger, .whatsapp-float, .back-to-top, .press-row, .press-tab, .media-logo-item, .magazine-instagram';

    document.addEventListener('mousemove', (e) => {
        curX = e.clientX;
        curY = e.clientY;

        // Check if hovering interactive element
        const target = e.target.closest(interactiveSelectors);
        if (target && !isHoveringInteractive) {
            isHoveringInteractive = true;
            glow.style.width = '550px';
            glow.style.height = '550px';
            glow.style.background = 'radial-gradient(circle, rgba(255, 107, 53, 0.07), transparent 60%)';
        } else if (!target && isHoveringInteractive) {
            isHoveringInteractive = false;
            glow.style.width = '400px';
            glow.style.height = '400px';
            glow.style.background = 'radial-gradient(circle, rgba(255, 107, 53, 0.04), transparent 60%)';
        }
    });

    function animateGlow() {
        glowX += (curX - glowX) * 0.06;
        glowY += (curY - glowY) * 0.06;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(animateGlow);
    }

    animateGlow();
}

// === Reveal Sections on Scroll ===
function initSectionReveal() {
    const sections = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, { threshold: 0.03 });

    sections.forEach(section => observer.observe(section));
}

// === Floating Card Hover Glow ===
function initCardGlow() {
    if (window.innerWidth <= 768) return;
    const cards = document.querySelectorAll('.floating-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255, 107, 53, 0.12), rgba(255, 255, 255, 0.07) 50%)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.background = 'rgba(255, 255, 255, 0.07)';
        });
    });
}

// === Premium Spotlight Hover Glow Effect ===
function initSpotlightHover() {
    const spotlightCards = document.querySelectorAll(
        '.stat-3d-wrap, .service-card-front, .why-card-3d, .case-card-3d, .testimonial-3d, .form-3d'
    );

    spotlightCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mx', `${x}px`);
            card.style.setProperty('--my', `${y}px`);
        });
    });
}

// === Split-Text Word Reveal Animation ===
function initSplitTextReveal() {
    // Select hero title and section titles
    const targets = document.querySelectorAll('.hero-title, .section-title');
    
    targets.forEach(el => {
        // Preserve gradient-text spans
        const html = el.innerHTML;
        
        // Create a temporary div to parse
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Process text nodes and preserve existing spans
        const fragments = [];
        temp.childNodes.forEach(node => {
            if (node.nodeType === 3) {
                // Text node — split into words
                const words = node.textContent.split(/(\s+)/);
                words.forEach(word => {
                    if (word.trim()) {
                        fragments.push(`<span class="word"><span class="word-inner">${word}</span></span>`);
                    } else if (word) {
                        fragments.push(word); // preserve whitespace
                    }
                });
            } else if (node.nodeType === 1) {
                // Element node (e.g., <span class="gradient-text">)
                const innerWords = node.textContent.split(/(\s+)/);
                const outerTag = node.outerHTML.replace(node.innerHTML, '{{INNER}}');
                innerWords.forEach(word => {
                    if (word.trim()) {
                        const wrapped = outerTag.replace('{{INNER}}', word);
                        fragments.push(`<span class="word"><span class="word-inner">${wrapped}</span></span>`);
                    } else if (word) {
                        fragments.push(word);
                    }
                });
            }
        });
        
        el.innerHTML = fragments.join('');
        el.classList.add('split-text');
    });

    // Observe and trigger reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.split-text').forEach(el => observer.observe(el));
}

// === Initialize Everything ===
function init() {
    initSmoothScroll();
    initParticles();
    initNavigation();
    initCounters();
    renderPressReleases();
    renderMagazines();
    initCarousel();
    initTiltEffect();
    initHero3D();
    initForm();
    initBackToTop();
    initWhatsApp();
    initMagneticButtons();
    initRipple();
    initParallax();
    initSectionReveal();
    initCursorGlow();
    initCardGlow();
    initSpotlightHover();
    initSplitTextReveal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}