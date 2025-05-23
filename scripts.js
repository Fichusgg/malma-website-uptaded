(function() {
    "use strict";

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', function() {
        const currentYearSpan = document.getElementById('currentYear');
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }

        handleHeader();
        handleHeroCarousel();
        handleListings();
        handleScrollAnimations();
    });

    function handleHeader() {
        const navToggle = document.querySelector('.nav-toggle');
        const navList = document.getElementById('navList');

        if (navToggle && navList) {
            navToggle.addEventListener('click', () => {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
                navToggle.setAttribute('aria-expanded', !isExpanded);
                navList.classList.toggle('active');
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navList.classList.contains('active')) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    navList.classList.remove('active');
                    navToggle.focus();
                }
            });

            document.addEventListener('click', (e) => {
                if (navList.classList.contains('active') && !navList.contains(e.target) && !navToggle.contains(e.target)) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    navList.classList.remove('active');
                }
            });
        }
    }

    function handleHeroCarousel() {
        const track = document.querySelector('.hero-image-carousel .carousel-track');
        if (!track) return;

        let slides = Array.from(track.children);
        if (slides.length <= 1) return;

        // Clone first slide and append it to the end for a seamless loop
        const firstClone = slides[0].cloneNode(true);
        track.appendChild(firstClone);
        
        slides = Array.from(track.children); // Update slides array with the clone

        let currentIndex = 0;
        const slideInterval = 5000; // 5 seconds
        const transitionStyle = `transform 0.8s cubic-bezier(0.35, 0, 0.25, 1)`;

        const slide = () => {
            currentIndex++;
            track.style.transition = transitionStyle;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;

            // When it reaches the cloned slide, reset to the beginning
            if (currentIndex === slides.length - 1) {
                setTimeout(() => {
                    track.style.transition = 'none';
                    currentIndex = 0;
                    track.style.transform = `translateX(0)`;
                }, 800); // Must match the transition duration
            }
        };

        if (!prefersReducedMotion) {
            setInterval(slide, slideInterval);
        }
    }

    function handleListings() {
        const panels = document.querySelectorAll('.listings-container .listing-panel');
        if (panels.length === 0 || window.innerWidth < 768) return; // Accordion only on desktop

        panels.forEach(panel => {
            panel.addEventListener('click', () => {
                // Do nothing if it's already active
                if (panel.classList.contains('active')) return;

                // Remove active class from all other panels
                panels.forEach(p => p.classList.remove('active'));
                
                // Add active class to the clicked panel
                panel.classList.add('active');
            });
        });
    }

    function handleScrollAnimations() {
        const animatedItems = document.querySelectorAll('#hero .animated-text, #hero .cta-button');
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            animatedItems.forEach(item => item.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedItems.forEach(item => observer.observe(item));
    }

})();