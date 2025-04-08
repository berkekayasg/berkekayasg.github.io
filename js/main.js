// Main JavaScript file

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    // --- Intro Screen Logic Start ---
    const introScreen = document.getElementById('intro-screen');
    const mainContentWrapper = document.getElementById('main-content-wrapper');
    const introPrompt = document.getElementById('intro-prompt');
    const headerNav = document.querySelector('header nav'); // Get the nav element
    // Main content and nav are hidden by CSS initially
    // --- Intro Screen Logic End ---
    console.log('Intro Screen:', introScreen);
    console.log('Intro Prompt:', introPrompt);
    console.log('Main Content Wrapper:', mainContentWrapper);
    console.log('Header Nav:', headerNav);

    const sections = document.querySelectorAll('main > section');
    const navLinks = document.querySelectorAll('header nav a[href^="#"]'); // Select nav links starting with #

    // Explicitly clear any active sections initially
    sections.forEach(section => section.classList.remove('active-section'));


    // --- Intro Screen Functions Start ---
    function hideIntroAndShowContent() {
        console.log('Running hideIntroAndShowContent...');
        if (introScreen) introScreen.style.display = 'none'; // Use display none to remove it completely
        if (mainContentWrapper) mainContentWrapper.classList.add('visible'); // Show main content wrapper
        if (headerNav) headerNav.classList.add('visible'); // Show nav

        // Initialize the SPA view AFTER content is visible
        // Ensure showSection is defined/accessible here
        showSection(window.location.hash);

        // Remove the event listeners after first interaction
        window.removeEventListener('keydown', handleIntroInteraction);
        if (introPrompt) { // Ensure prompt exists before removing listener
             introPrompt.removeEventListener('click', handleIntroInteraction);
        }
    }

    const handleIntroInteraction = () => {
        console.log('Handling intro interaction...');
        // Check if the intro screen exists and its computed display style is not 'none'
        if (introScreen && window.getComputedStyle(introScreen).display !== 'none') {
             hideIntroAndShowContent();
        }
    };
    // --- Intro Screen Functions End ---

    // Function to show a specific section and hide others
    function showSection(sectionId) {
        // Default to 'home' if no ID is provided or if it's just '#'
        const idToShow = (sectionId && sectionId !== '#') ? sectionId.substring(1) : 'home'; 
        
        let sectionFound = false;
        sections.forEach(section => {
            if (section.id === idToShow) {
                section.classList.add('active-section');
                sectionFound = true;
            } else {
                section.classList.remove('active-section');
            }
        });

        // Fallback to home if the requested section ID doesn't exist
        if (!sectionFound && document.getElementById('home')) {
             console.warn(`Section with ID "${idToShow}" not found. Showing home section.`);
             document.getElementById('home').classList.add('active-section');
        }

        // Update active state on nav links (optional but good UX)
        navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${idToShow}`) {
                link.classList.add('active-link'); // Add a class for styling the active link
            } else {
                link.classList.remove('active-link');
            }
        });
    }

    // --- Intro Screen Initialization Start ---
    if (introScreen && introPrompt) {
        console.log('Intro screen and prompt found. Setting up intro logic.');

        // Set initial styles directly
        introPrompt.style.opacity = '0';
        introPrompt.style.visibility = 'hidden';
        console.log('Initial styles set directly.');

        // Make the prompt visible in the next frame by changing styles
        requestAnimationFrame(() => {
            console.log('Setting final styles directly (using rAF).');
            introPrompt.style.visibility = 'visible';
            introPrompt.style.opacity = '1';
        });

        // Add listeners to hide intro on interaction
        window.addEventListener('keydown', handleIntroInteraction, { once: true });
        introPrompt.addEventListener('click', handleIntroInteraction, { once: true });
    } else {
        // If no intro screen, show content and nav immediately and initialize SPA
        console.log("No intro screen found, showing main content/nav and initializing SPA.");
        console.log('No intro screen found or prompt missing. Skipping intro logic.');
        if (mainContentWrapper) mainContentWrapper.classList.add('visible');
        if (headerNav) headerNav.classList.add('visible');
        showSection(window.location.hash); // Initialize SPA right away
    }
    // --- Intro Screen Initialization End ---

    // Handle initial page load based on hash - MOVED into intro logic above
    // showSection(window.location.hash);

    // Add click listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default anchor jump
            const sectionId = link.getAttribute('href');
            
            // Update URL hash
            // Using history.pushState for smoother navigation without page jump
            if (window.location.hash !== sectionId) {
               history.pushState(null, '', sectionId); 
            }
            
            showSection(sectionId);
        });
    });

    // Listen for hash changes (e.g., browser back/forward buttons)
    window.addEventListener('hashchange', () => {
        showSection(window.location.hash);
    });

    // Optional: Add listeners to other internal links (like CTAs) if they exist
    const internalLinks = document.querySelectorAll('a[href^="#"]:not(header nav a)'); // Select internal links not in the main nav
    internalLinks.forEach(link => {
         link.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = link.getAttribute('href');
             if (window.location.hash !== sectionId) {
               history.pushState(null, '', sectionId); 
            }
            showSection(sectionId);
        });
    });

});

    // Update footer year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }