/**
 * main.js — Site-wide JavaScript
 *
 * Runs on every page. Handles:
 *  - Mobile navigation hamburger menu
 *  - Auto-highlighting the active nav link (based on current URL)
 */

(function () {
    'use strict';

    // ── Mobile nav toggle ──────────────────────────────────────────────────
    // The hamburger button (<button class="nav-toggle">) shows/hides the <nav>
    // on screens narrower than 620px (defined in style.css).

    const toggle = document.getElementById('navToggle');
    const nav    = document.querySelector('nav');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        // Close the nav when a link is clicked (single-page navigation)
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close if user clicks outside the header
        document.addEventListener('click', (e) => {
            if (!e.target.closest('header')) {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ── Active nav link ────────────────────────────────────────────────────
    // Adds the .active class to the nav link that matches the current page.
    // This removes the need to hardcode class="active" in every HTML file
    // (though the HTML still has it as a no-JS fallback).

    const currentFile = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href === currentFile) {
            link.classList.add('active');
        } else {
            // Remove any hardcoded .active that doesn't match
            // (in case we're on a page the HTML didn't anticipate)
            if (!href || href !== currentFile) {
                link.classList.remove('active');
            }
        }
    });

})();
