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
            }, 0);
        }
        window.removeEventListener('keydown', handleIntroInteraction);
        if (introPrompt) {
            introPrompt.removeEventListener('click', handleIntroInteraction);
        }
    }

    const handleIntroInteraction = () => {
        if (introScreen && window.getComputedStyle(introScreen).display !== 'none' && introPrompt) {

            introPrompt.classList.add('button-active');


            setTimeout(() => {
                introPrompt.classList.remove('button-active');
                hideIntroAndShowMenu();
            }, 800);


            window.removeEventListener('keydown', handleIntroInteraction);
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

        const introClickListener = (event) => {
            event.preventDefault();
            handleIntroInteraction();

            introPrompt.removeEventListener('click', introClickListener);
        };
        introPrompt.addEventListener('click', introClickListener, { once: true });
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
            const button = event.currentTarget;
            const targetSectionId = button.getAttribute('href');

            if (targetSectionId && targetSectionId !== '#') {
                button.classList.add('button-active');
                setTimeout(() => {
                    button.classList.remove('button-active');
                    showSection(targetSectionId);
                }, 800);
            }
        });
    });

    backButtons.forEach(button => {
        button.addEventListener('click', (event) => {
             event.preventDefault();
             const btn = event.currentTarget;
             btn.classList.add('button-active');
             setTimeout(() => {
                 btn.classList.remove('button-active');
                 showMenu();
             }, 800);
        });
    });



    const quitButton = document.getElementById('quit-button');
    if (quitButton) {
        quitButton.addEventListener('click', (event) => {
            event.preventDefault();
            const button = event.currentTarget;
            button.classList.add('button-active');

            setTimeout(() => {
                button.classList.remove('button-active');

                const screenWrapper = document.getElementById('screen-wrapper');
                const crtFrame = document.getElementsByClassName('crt-frame')[0];
                if (screenWrapper) {
                    screenWrapper.classList.add('powering-off');
                    crtFrame.classList.add('powering-off');
                    setTimeout(() => {
                        screenWrapper.style.display = 'none';
                    }, 750);
                }
            }, 800);
        });
    }
});