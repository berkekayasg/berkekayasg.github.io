document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const introScreen = document.getElementById('intro-screen');
    const introPrompt = document.getElementById('intro-prompt');
    const header = document.querySelector('header');
    const mainMenu = document.getElementById('main-menu');
    const menuLinks = document.querySelectorAll('#main-menu a[href^="#"]');
    const sections = document.querySelectorAll('main > section');
    const backButtons = document.querySelectorAll('.back-button');
    const footer = document.querySelector('footer');

    // --- Initial State ---
    sections.forEach(section => section.classList.remove('active-section'));
    if (introScreen) {
        if (mainMenu) mainMenu.classList.add('hidden');
        if (footer) footer.classList.remove('visible');
    } else {
        if (header) header.classList.remove('hidden');
        if (mainMenu) mainMenu.classList.remove('hidden');
        if (footer) footer.classList.add('visible');
        showMenu();
    }

    // --- Intro Screen Logic ---
    function hideIntroAndShowMenu() {
        if (introScreen) {
            introScreen.classList.add('fade-out');
            setTimeout(() => {
                introScreen.style.display = 'none';
                if (header) header.classList.remove('hidden');
                if (mainMenu) mainMenu.classList.remove('hidden');
                if (footer) footer.classList.add('visible');
            }, 500);
        }
        window.removeEventListener('keydown', handleIntroInteraction);
        if (introPrompt) {
            introPrompt.removeEventListener('click', handleIntroInteraction);
        }
    }

    const handleIntroInteraction = () => {
        if (introScreen && window.getComputedStyle(introScreen).display !== 'none') {
            hideIntroAndShowMenu();
        }
    };

    // --- Intro Screen Initialization ---
    if (introScreen && introPrompt) {
        introPrompt.style.opacity = '0';
        introPrompt.style.visibility = 'hidden';
        requestAnimationFrame(() => {
            introPrompt.style.visibility = 'visible';
            introPrompt.style.opacity = '1';
        });
        window.addEventListener('keydown', handleIntroInteraction, { once: true });
        introPrompt.addEventListener('click', handleIntroInteraction, { once: true });
    }

    // --- Full-Screen Navigation Logic ---
    function showSection(targetId) {
        if (mainMenu) mainMenu.classList.add('hidden');
        if (footer) footer.classList.remove('visible');

        sections.forEach(section => {
            if (`#${section.id}` === targetId) {
                section.classList.add('active-section');
            } else {
                section.classList.remove('active-section');
            }
        });
    }

    function showMenu() {
        sections.forEach(section => section.classList.remove('active-section'));
        if (header) header.classList.remove('hidden');
        if (mainMenu) mainMenu.classList.remove('hidden');
        if (footer) footer.classList.add('visible');
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetSectionId = link.getAttribute('href');
            if (targetSectionId && targetSectionId !== '#') {
                showSection(targetSectionId);
            }
        });
    });

    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            showMenu();
        });
    });

    // --- Footer Year Update ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Quit button closes the tab
    const quitButton = document.getElementById('quit-button');
    if (quitButton) {
        quitButton.addEventListener('click', (e) => {
            e.preventDefault();
            const screenWrapper = document.getElementById('screen-wrapper');
            if (screenWrapper) {
                screenWrapper.classList.add('powering-off');
                setTimeout(() => {
                    screenWrapper.style.display = 'none';
                }, 1000);
            }
        });
    }
});