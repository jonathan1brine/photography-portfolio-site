/**
 * gallery.js — Photography portfolio gallery functionality
 *
 * This file powers all gallery pages (Japan, Sydney, Melbourne, Adelaide).
 * Each gallery page only needs to define a `photos` array and call:
 *
 *   initGallery(photos);
 *
 * Features:
 *  - Intersection Observer lazy loading (200px pre-load before viewport)
 *  - WebP thumbnail support with automatic JPG fallback
 *  - Blur-in reveal animation when each image loads
 *  - Lightbox modal with prev/next navigation
 *  - Photo counter ("5 / 47") in the modal
 *  - Keyboard navigation (← → Esc)
 *  - Touch swipe support for mobile
 *  - Keyboard hint on first modal open (fades out automatically)
 *  - Scroll-to-top button that appears after scrolling down
 *  - Photo count injected into the page header
 */

(function () {
    'use strict';

    // ─── Module State ──────────────────────────────────────────────────────

    let _photos       = [];    // Photos array for the current gallery
    let _currentIndex = 0;     // Currently open photo index
    let _hintShown    = false; // Whether we've shown the keyboard hint yet

    // ─── Path Helpers ──────────────────────────────────────────────────────

    /**
     * Derives the WebP thumbnail path from the original source path.
     * e.g. "images/japan/DSC01579.jpg" → "images/japan/thumbs/DSC01579.webp"
     *
     * Run convert_to_webp.py to generate these thumbnails.
     * The gallery falls back to the original JPG if a thumb isn't found.
     */
    function getThumbPath(src) {
        const lastSlash = src.lastIndexOf('/');
        const dir       = src.substring(0, lastSlash);
        const filename  = src.substring(lastSlash + 1).replace(/\.(jpe?g)$/i, '.webp');
        return `${dir}/thumbs/${filename}`;
    }

    // ─── Gallery Building ──────────────────────────────────────────────────

    /**
     * Builds the masonry gallery grid and sets up Intersection Observer
     * lazy loading. Images only start downloading as they approach the viewport.
     */
    function buildGallery() {
        const gallery = document.getElementById('gallery');
        if (!gallery) return;

        // Intersection Observer fires when elements enter/leave the viewport.
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        loadImage(entry.target);
                        observer.unobserve(entry.target); // Only need to load once
                    }
                });
            },
            { rootMargin: '200px 0px' } // Start loading 200px before visible
        );

        _photos.forEach((photo, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            const img = document.createElement('img');
            img.alt        = photo.title || '';
            img.decoding   = 'async';
            img.dataset.src   = photo.src;
            img.dataset.thumb = getThumbPath(photo.src);

            img.addEventListener('click', () => showModal(index));

            item.appendChild(img);
            gallery.appendChild(item);
            observer.observe(img);
        });

        // Update the photo count in the page header (if the element exists)
        const countEl = document.getElementById('photoCount');
        if (countEl) {
            const n = _photos.length;
            countEl.textContent = `${n} photo${n !== 1 ? 's' : ''}`;
        }
    }

    /**
     * Starts loading an image. Tries the WebP thumbnail first.
     * If that 404s (thumb not generated yet), falls back to the original JPG.
     */
    function loadImage(img) {
        const thumbSrc   = img.dataset.thumb;
        const originalSrc = img.dataset.src;

        function tryLoad(src, fallback) {
            img.onload  = () => img.classList.add('loaded');
            img.onerror = fallback
                ? () => tryLoad(fallback, null) // WebP failed — try JPG
                : () => img.classList.add('loaded'); // JPG also failed, still reveal
            img.src = src;
        }

        tryLoad(thumbSrc, originalSrc);
    }

    // ─── Lightbox Modal ────────────────────────────────────────────────────

    /**
     * Opens the modal for the photo at `index`.
     * Always loads the full-resolution original (not the thumbnail).
     */
    function showModal(index) {
        _currentIndex = index;
        const photo = _photos[index];

        const modal       = document.getElementById('modal');
        const modalImg    = document.getElementById('modalImg');
        const modalDesc   = document.getElementById('modalDesc');
        const modalCounter = document.getElementById('modalCounter');
        const prevBtn     = document.getElementById('prevBtn');
        const nextBtn     = document.getElementById('nextBtn');

        // Fade in the full-size image once it loads
        modalImg.style.opacity = '0';
        modalImg.onload = () => {
            modalImg.style.transition = 'opacity 0.25s ease';
            modalImg.style.opacity = '1';
        };

        // Full-size original in modal — not the compressed thumbnail
        modalImg.src = photo.src;
        modalImg.alt = photo.title || '';

        // Show description only if there is one
        if (photo.desc) {
            modalDesc.textContent = photo.desc;
            modalDesc.style.display = '';
        } else {
            modalDesc.textContent = '';
            modalDesc.style.display = 'none';
        }

        // Photo counter: "5 / 47"
        if (modalCounter) {
            modalCounter.textContent = `${index + 1} / ${_photos.length}`;
        }

        // Disable nav buttons at boundaries
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === _photos.length - 1;

        // Open modal and lock body scroll
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Show keyboard hint the first time the modal is opened
        if (!_hintShown) {
            _hintShown = true;
            const hint = document.createElement('p');
            hint.className = 'modal-hint';
            hint.textContent = '\u2190 \u2192 navigate \u00b7 Esc close';
            document.querySelector('.modal-meta').appendChild(hint);
            // Remove from DOM after animation completes
            setTimeout(() => hint.remove(), 4500);
        }
    }

    /**
     * Closes the lightbox modal.
     */
    function closeModal() {
        const modal = document.getElementById('modal');
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    /**
     * Navigates the modal to the previous (dir = -1) or next (dir = 1) photo.
     */
    function navigateModal(dir) {
        const next = _currentIndex + dir;
        if (next >= 0 && next < _photos.length) {
            showModal(next);
        }
    }

    // ─── Event Listeners ───────────────────────────────────────────────────

    function setupEvents() {
        // ── Keyboard navigation ──
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('modal');
            if (!modal || !modal.classList.contains('open')) return;
            if (e.key === 'Escape')     closeModal();
            if (e.key === 'ArrowLeft')  navigateModal(-1);
            if (e.key === 'ArrowRight') navigateModal(1);
        });

        // ── Touch swipe (mobile) ──
        // Swipe left = next photo, swipe right = previous photo.
        let touchStartX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const modal = document.getElementById('modal');
            if (!modal || !modal.classList.contains('open')) return;

            const deltaX = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(deltaX) > 50) {
                navigateModal(deltaX < 0 ? 1 : -1);
            }
        }, { passive: true });
    }

    // ─── Scroll To Top ─────────────────────────────────────────────────────

    function setupScrollToTop() {
        const btn = document.getElementById('scrollTopBtn');
        if (!btn) return;

        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ─── Public API ────────────────────────────────────────────────────────

    /**
     * Main entry point. Call this from each gallery page.
     *
     * @param {Array<{src: string, title: string, desc: string}>} photos
     */
    function initGallery(photos) {
        _photos = photos;
        buildGallery();
        setupEvents();
        setupScrollToTop();
    }

    // Expose functions needed by HTML onclick attributes
    window.initGallery   = initGallery;
    window.closeModal    = closeModal;
    window.navigateModal = navigateModal;

})();
