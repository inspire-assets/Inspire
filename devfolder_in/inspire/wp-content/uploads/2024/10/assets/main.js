/* ============================================= */
/*  Inspire — Main JavaScript                    */
/*  GSAP ScrollTrigger, AOS, Particle Canvas,     */
/*  Animated Counters, Navigation, Modal          */
/* ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ===========================
    //  INITIALIZE AOS
    // ===========================
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 60,
        disable: false,
    });

    // ===========================
    //  MOBILE NAV
    // ===========================
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }

    // ===========================
    //  NAVBAR SCROLL
    // ===========================
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }
    });

    // ===========================
    //  PARTICLE CANVAS (Hero)
    // ===========================
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;
        let mouseX = 0, mouseY = 0;

        function resizeCanvas() {
            const parent = canvas.parentElement;
            canvas.width = parent.offsetWidth;
            canvas.height = parent.offsetHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Track mouse for interactive glow
        canvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = canvas.parentElement.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.4;
                this.speedY = (Math.random() - 0.5) * 0.4;
                this.opacity = Math.random() * 0.4 + 0.1;
                this.pulseSpeed = Math.random() * 0.02 + 0.005;
                this.pulsePhase = Math.random() * Math.PI * 2;
                this.isGold = Math.random() < 0.3;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.pulsePhase += this.pulseSpeed;

                // Mouse interaction - subtle attraction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    this.x += dx * 0.001;
                    this.y += dy * 0.001;
                }

                // Wrap around
                if (this.x < -10) this.x = canvas.width + 10;
                if (this.x > canvas.width + 10) this.x = -10;
                if (this.y < -10) this.y = canvas.height + 10;
                if (this.y > canvas.height + 10) this.y = -10;
            }

            draw() {
                const pulseFactor = Math.sin(this.pulsePhase) * 0.3 + 0.7;
                const alpha = this.opacity * pulseFactor;

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

                if (this.isGold) {
                    ctx.fillStyle = `rgba(232, 192, 83, ${alpha})`;
                } else {
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                }

                ctx.fill();

                // Glow effect for gold particles
                if (this.isGold && this.size > 1) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(232, 192, 83, ${alpha * 0.08})`;
                    ctx.fill();
                }
            }
        }

        // Create particles
        const particleCount = Math.min(Math.floor(canvas.width * canvas.height / 8000), 120);
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Draw connection lines between nearby particles
        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        const alpha = (1 - dist / 120) * 0.08;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);

                        if (particles[i].isGold || particles[j].isGold) {
                            ctx.strokeStyle = `rgba(232, 192, 83, ${alpha})`;
                        } else {
                            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                        }

                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            drawConnections();
            animationId = requestAnimationFrame(animate);
        }

        animate();

        // Pause animation when hero is not visible
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animationId) animate();
                } else {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            });
        });
        heroObserver.observe(canvas.parentElement);
    }

    // ===========================
    //  GSAP SCROLL ANIMATIONS
    // ===========================
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Parallax on cert cards
        gsap.utils.toArray('.cert-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                y: 40,
                opacity: 0,
                duration: 0.8,
                delay: i * 0.1,
                ease: 'power3.out',
            });
        });

        // Horizontal line animation on section headers
        gsap.utils.toArray('.section-header').forEach(header => {
            gsap.from(header, {
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
            });
        });

        // Scale-in for stat items
        gsap.utils.toArray('.stat-item').forEach((item, i) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 90%',
                },
                scale: 0.85,
                opacity: 0,
                duration: 0.7,
                delay: i * 0.15,
                ease: 'back.out(1.7)',
            });
        });

        // Service cards staggered entrance
        gsap.utils.toArray('.service-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 88%',
                },
                y: 50,
                opacity: 0,
                duration: 0.7,
                delay: (i % 4) * 0.1,
                ease: 'power3.out',
            });
        });

        // Cert detail cards slide in
        gsap.utils.toArray('.cert-detail-card').forEach((card, i) => {
            const isReverse = card.classList.contains('reverse');
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                },
                x: isReverse ? -60 : 60,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
            });
        });

        // CTA card zoom
        const ctaCard = document.querySelector('.cta-card');
        if (ctaCard) {
            gsap.from(ctaCard, {
                scrollTrigger: {
                    trigger: ctaCard,
                    start: 'top 85%',
                },
                scale: 0.9,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
            });
        }

        // Magnetic hover effect on buttons
        document.querySelectorAll('.btn-glow, .btn-outline-light').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(btn, {
                    x: x * 0.15,
                    y: y * 0.15,
                    duration: 0.3,
                    ease: 'power2.out',
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: 'elastic.out(1, 0.5)',
                });
            });
        });

        // Tilt effect on glass cards
        document.querySelectorAll('.cert-card, .why-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                gsap.to(card, {
                    rotateY: x * 8,
                    rotateX: -y * 8,
                    duration: 0.4,
                    ease: 'power2.out',
                    transformPerspective: 800,
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateY: 0,
                    rotateX: 0,
                    duration: 0.6,
                    ease: 'power3.out',
                });
            });
        });
    }

    // ===========================
    //  ANIMATED COUNTERS
    // ===========================
    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 2200;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quart
            const eased = 1 - Math.pow(1 - progress, 4);
            el.textContent = Math.floor(eased * target);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        }

        requestAnimationFrame(update);
    }

    // ===========================
    //  SMOOTH SCROLL
    // ===========================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});

// ===========================
//  CERTIFICATE MODAL
// ===========================
function openCertModal(imgSrc, title) {
    const modal = document.getElementById('certModal');
    const modalImg = document.getElementById('certModalImg');
    const modalTitle = document.getElementById('certModalTitle');

    if (modal && modalImg && modalTitle) {
        modalImg.src = imgSrc;
        modalImg.alt = title;
        modalTitle.textContent = title;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // GSAP entrance
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(modal.querySelector('.cert-modal-content'), {
                scale: 0.85,
                opacity: 0,
                y: 60,
            }, {
                scale: 1,
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'back.out(1.4)',
            });
        }
    }
}

function closeCertModal() {
    const modal = document.getElementById('certModal');
    if (modal) {
        if (typeof gsap !== 'undefined') {
            gsap.to(modal.querySelector('.cert-modal-content'), {
                scale: 0.9,
                opacity: 0,
                y: 40,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                },
            });
        } else {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCertModal();
});
