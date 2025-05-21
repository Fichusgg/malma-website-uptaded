(function() {
    "use strict";

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', function() {

        // Update current year in footer
        const currentYearSpan = document.getElementById('currentYear');
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }

        // 2.1 ▪ Header Logic
        handleHeader();

        // 2.2 ▪ Hero Section Logic
        handleHeroSection();

        // 2.4 ▪ Listings Section Logic
        handleListingsSection();

        // Add 'js-loaded' class to body to enable JS-dependent styles/animations
        document.body.classList.add('js-loaded');
    });

    function handleHeader() {
        const header = document.querySelector('header');
        const logo = document.querySelector('.logo');
        const navToggle = document.querySelector('.nav-toggle');
        const navList = document.getElementById('navList');

        // Logo fade-in is handled by CSS animation on load

        // Hamburger menu
        if (navToggle && navList) {
            navToggle.addEventListener('click', () => {
                const isExpanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
                navToggle.setAttribute('aria-expanded', !isExpanded);
                navList.classList.toggle('active');
                // Optional: trap focus within menu when open
            });

            // Dismiss menu on ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navList.classList.contains('active')) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    navList.classList.remove('active');
                    navToggle.focus();
                }
            });

            // Dismiss menu on click outside (if menu is open)
            document.addEventListener('click', (e) => {
                if (navList.classList.contains('active') &&
                    !navList.contains(e.target) &&
                    !navToggle.contains(e.target)) {
                    navToggle.setAttribute('aria-expanded', 'false');
                    navList.classList.remove('active');
                }
            });
        }
    }

    function handleHeroSection() {
        // Text fade-in on scroll (IntersectionObserver)
        const animatedTexts = document.querySelectorAll('#hero .animated-text, #hero .cta-button');
        if (animatedTexts.length > 0 && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            animatedTexts.forEach(text => {
                if (!prefersReducedMotion) {
                    observer.observe(text);
                } else {
                    text.classList.add('visible'); // Show immediately if motion is reduced
                }
            });
        } else { // Fallback for no IntersectionObserver or for prefersReducedMotion
             animatedTexts.forEach(text => text.classList.add('visible'));
        }


        // Image Carousel
        const carouselTrack = document.querySelector('.hero-image-carousel .carousel-track');
        const slides = Array.from(carouselTrack ? carouselTrack.children : []);
        const nextButton = document.querySelector('.hero-image-carousel .next');
        const prevButton = document.querySelector('.hero-image-carousel .prev');
        const indicatorsContainer = document.querySelector('.hero-image-carousel .carousel-indicators');

        if (!carouselTrack || slides.length === 0) return;

        let currentIndex = 0;
        const slideWidth = slides[0].getBoundingClientRect().width;
        let autoPlayInterval;

        // Create indicators
        slides.forEach((_, i) => {
            const button = document.createElement('button');
            button.classList.add('carousel-indicator');
            button.setAttribute('aria-label', `Go to slide ${i + 1}`);
            if (i === 0) button.classList.add('active');
            button.addEventListener('click', () => {
                stopAutoPlay();
                moveToSlide(i);
                startAutoPlay();
            });
            indicatorsContainer.appendChild(button);
        });
        const indicators = Array.from(indicatorsContainer.children);

        function updateIndicators() {
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === currentIndex);
            });
        }

        function moveToSlide(targetIndex) {
            if (!carouselTrack) return;
            // Calculate the new transform value.
            // The "peeking" effect is mostly CSS driven if slides have margin/padding.
            // JS just needs to set the correct slide as current.
            carouselTrack.style.transform = 'translateX(-' + targetIndex * 100 + '%)';


            slides.forEach(s => s.classList.remove('current-slide'));
            slides[targetIndex].classList.add('current-slide');
            currentIndex = targetIndex;
            updateIndicators();
        }
        
        // To achieve the "visible next image edge on left" feel:
        // The CSS is set up to have slides with min-width 100% and the track uses flex.
        // The overflow:hidden on hero-image-carousel and track-container is key.
        // When we translate the track, the edges of other slides naturally show if their
        // widths are managed correctly (e.g. slightly less than 100% or with negative margins like in current CSS).
        // The current CSS uses `carousel-slide:not(.current-slide) { margin-left: -20%; margin-right: -20%; }`
        // This means the JS logic for `moveToSlide` using `translateX(-${targetIndex * 100}%)` should work well
        // with the CSS to create the peeking effect.

        if (nextButton && prevButton) {
            nextButton.addEventListener('click', () => {
                stopAutoPlay();
                currentIndex = (currentIndex + 1) % slides.length;
                moveToSlide(currentIndex);
                startAutoPlay();
            });

            prevButton.addEventListener('click', () => {
                stopAutoPlay();
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                moveToSlide(currentIndex);
                startAutoPlay();
            });
        }

        function startAutoPlay() {
            if (prefersReducedMotion || slides.length <= 1) return;
            stopAutoPlay(); // Clear existing interval
            autoPlayInterval = setInterval(() => {
                currentIndex = (currentIndex + 1) % slides.length;
                moveToSlide(currentIndex);
            }, 5000);
        }

        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }
        
        // Initial setup
        moveToSlide(0); // Set initial slide
        startAutoPlay(); // Start auto-play

        // Pause autoplay on hover
        const carouselElement = document.querySelector('.hero-image-carousel');
        if (carouselElement) {
            carouselElement.addEventListener('mouseenter', stopAutoPlay);
            carouselElement.addEventListener('mouseleave', startAutoPlay);
            carouselElement.addEventListener('focusin', stopAutoPlay); // for keyboard users
            carouselElement.addEventListener('focusout', startAutoPlay); // for keyboard users
        }
    }

    function handleListingsSection() {
        const panelTabs = document.querySelectorAll('#projects .panel-tab');
        const panelCards = document.querySelectorAll('#projects .panel-card');

        if (panelTabs.length === 0 || panelCards.length === 0) return;

        function setActivePanel(tabId) {
            const targetCardId = tabId.replace('-tab', '-content');

            panelTabs.forEach(tab => {
                const isCurrentTab = tab.id === tabId;
                tab.classList.toggle('active', isCurrentTab);
                tab.setAttribute('aria-selected', isCurrentTab);
            });

            panelCards.forEach(card => {
                const isCurrentCard = card.id === targetCardId;
                card.classList.toggle('active', isCurrentCard);
                if (isCurrentCard) {
                    card.removeAttribute('hidden');
                } else {
                    card.setAttribute('hidden', '');
                }
            });
        }

        panelTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                if (!prefersReducedMotion) {
                    // Allow CSS transitions to play
                    setActivePanel(tab.id);
                } else {
                    // Instant change if motion is reduced
                    // Temporarily disable transitions for instant change
                    const cardsToTransition = Array.from(panelCards);
                    cardsToTransition.forEach(c => c.style.transition = 'none');
                    
                    setActivePanel(tab.id);

                    // Restore transitions after a short delay
                    setTimeout(() => {
                        cardsToTransition.forEach(c => c.style.transition = '');
                    }, 50);
                }
            });
        });

        // Set default active panel (Q2)
        const defaultActiveTab = document.getElementById('panel-q2-tab');
        if (defaultActiveTab) {
            setActivePanel(defaultActiveTab.id);
        } else if (panelTabs.length > 0) {
            // Fallback to first tab if Q2 doesn't exist
             setActivePanel(panelTabs[0].id);
        }
    }

    // About Us Section - Dynamic image height (if needed, currently CSS handles it well with flex)
    // This might be needed if the height of .about-image-large needs to strictly match .about-left
    // window.addEventListener('load', matchAboutImageHeight);
    // window.addEventListener('resize', debounce(matchAboutImageHeight, 200));

    // function matchAboutImageHeight() {
    //     const aboutLeft = document.querySelector('.about-left');
    //     const aboutImageLargeContainer = document.querySelector('.about-image-large');
    //     if (aboutLeft && aboutImageLargeContainer && window.innerWidth >= 768) { // Only on larger screens
    //         aboutImageLargeContainer.style.height = `${aboutLeft.offsetHeight}px`;
    //     } else if (aboutImageLargeContainer) {
    //         aboutImageLargeContainer.style.height = ''; // Reset for smaller screens
    //     }
    // }

    // Debounce utility
    // function debounce(func, wait) {
    //     let timeout;
    //     return function executedFunction(...args) {
    //         const later = () => {
    //             clearTimeout(timeout);
    //             func(...args);
    //         };
    //         clearTimeout(timeout);
    //         timeout = setTimeout(later, wait);
    //     };
    // }

})();