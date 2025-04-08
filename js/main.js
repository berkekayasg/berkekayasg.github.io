// Main JavaScript file

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('main > section');
    const navLinks = document.querySelectorAll('header nav a[href^="#"]'); // Select nav links starting with #

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

    // Handle initial page load based on hash
    showSection(window.location.hash);

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