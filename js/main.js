// Project data will be loaded from projects.json
document.addEventListener('DOMContentLoaded', () => {
    // Variable to hold fetched project data
    let projectsData = [];

    // --- Element References ---
    const introScreen = document.getElementById('intro-screen');
    const introPrompt = document.getElementById('intro-prompt');
    const header = document.querySelector('header');
    const mainHeading = document.querySelector('header h1'); // Added for dynamic heading
    const mainMenu = document.getElementById('main-menu');
    const menuLinks = document.querySelectorAll('#main-menu a[href^="#"]');
    const sections = document.querySelectorAll('main > section');
    const backButtons = document.querySelectorAll('.back-button'); // General back buttons
    const footer = document.querySelector('footer');
    const screenWrapper = document.getElementById('screen-wrapper'); // Added for power-off
    const crtFrame = document.getElementsByClassName('crt-frame')[0]; // Added for power-off

    // Project Section Elements
    const projectsSection = document.getElementById('projects');
    const projectSelectView = document.getElementById('project-select-view');
    const projectDetailView = document.getElementById('project-detail-view');
    const projectDetailTitle = document.getElementById('project-detail-title');
    const projectDetailDescription = document.getElementById('project-detail-description');
    const projectDetailSummary = document.getElementById('project-detail-summary'); // New summary element
    // New Detail View Elements
    const projectPageOverview = document.getElementById('page-overview');
    const projectPageDetails = document.getElementById('page-details');
    const projectPageLinksMedia = document.getElementById('page-links-media');
    const projectPageFullDescription = document.getElementById('page-full-description'); // New description page
    const projectDetailStatus = document.getElementById('project-detail-status');
    const projectDetailPlatform = document.getElementById('project-detail-platform');
    const projectDetailTech = document.getElementById('project-detail-tech');
    const projectDetailFeatures = document.getElementById('project-detail-features');
    const projectDetailLinks = document.getElementById('project-detail-links');
    const projectPlayButton = document.getElementById('project-play-button'); // Still needed for video
    // Pagination Elements
    const projectPageNav = document.getElementById('project-page-nav');
    const prevPageButton = document.getElementById('prev-page-button');
    const nextPageButton = document.getElementById('next-page-button');
    const pageIndicator = document.getElementById('page-indicator');
    const projectsBackButton = projectsSection ? projectsSection.querySelector('.back-button') : null;
    const projectsNavBackButton = projectsSection ? projectsSection.querySelectorAll('.back-button')[1] : null; // For the detail view footer
    // Video View Elements (remain the same)
    const projectVideoView = document.getElementById('project-video-view');
    const projectCloseVideoButton = document.getElementById('project-close-video-button');
    const youtubePlayerDiv = document.getElementById('youtube-player'); // The div for the iframe

    // --- Pagination State ---
    let currentPage = 1;
    const totalPages = 4; // Overview, Description, Details, Links/Media

    // --- Audio Element References ---
    const audioCrtHum = document.getElementById('audio-crt-hum');
    const audioIntroConfirm = document.getElementById('audio-intro-confirm');
    const audioButtonClick = document.getElementById('audio-button-click');
    const audioButtonBack = document.getElementById('audio-button-back');
    const audioProjectPlay = document.getElementById('audio-project-play');
    const audioPowerOff = document.getElementById('audio-power-off');
    const audioPowerOn = document.getElementById('audio-power-on');
    const audioPowerOnOff = document.getElementById('audio-power-on-off');
    // --- YouTube Player API ---
    let ytPlayer = null; // Variable to hold the YouTube player instance
    let youtubeApiReady = false;
    let videoToLoad = null; // Store video ID if API isn't ready yet

    // --- Initial State ---
    sections.forEach(section => section.classList.remove('active-section'));

    // --- Sound Playback Helper ---
    function playSound(audioElement) {
        if (audioElement) {
            audioElement.currentTime = 0; // Reset playback
            audioElement.play().catch(error => console.error("Audio play failed:", error));
        }
    }
    // --- Power On Effect ---
    function powerOnEffect() {
        console.log("Executing Power On Effect...");
        if (screenWrapper && crtFrame && audioPowerOn && audioCrtHum) {
            // 1. Reset display style set by powerOff
            screenWrapper.style.display = '';

            // 2. Remove power-off visual class (if present)
            screenWrapper.classList.remove('powering-off');
            crtFrame.classList.remove('powering-off');

            screenWrapper.classList.add('powering-on');
            crtFrame.classList.add('powering-on');
            setTimeout(() => {
                screenWrapper.classList.remove('powering-on');
                crtFrame.classList.remove('powering-on');
                crtFrame.style.filter = 'brightness(1)';
            }, 800); // Keep visual delay
            
            mainMenu.classList.add('hidden');
            footer.classList.remove('visible');
            introScreen.classList.remove('fade-out');
            introScreen.style.display = '';
            
            // 3. Play sounds
            playSound(audioPowerOn);
            setTimeout(() => { playSound(audioCrtHum); }, 800);
            setTimeout(() => { playSound(audioPowerOnOff); }, 400);
        } else {
            console.error("Power On Effect: Missing required elements (screenWrapper, crtFrame, audioPowerOn, or audioCrtHum).");
        }
    }


    if (introScreen) {
        if (mainMenu) mainMenu.classList.add('hidden');
        if (footer) footer.classList.remove('visible');
    } else {
        if (header) header.classList.remove('hidden');
        if (mainMenu) mainMenu.classList.remove('hidden');
        if (footer) footer.classList.add('visible');
        showMenu();
    }

    // --- Initial Power On ---
    screenWrapper.style.display = 'none'
    crtFrame.style.filter = 'brightness(0.5)';

    // --- Intro Screen Logic ---
    function hideIntroAndShowMenu() {
        if (introScreen) {
            introScreen.classList.add('fade-out');
            setTimeout(() => {
                introScreen.style.display = 'none';
                if (header) header.classList.remove('hidden');
                if (mainMenu) mainMenu.classList.remove('hidden');
                if (footer) footer.classList.add('visible');
                updateMainHeading(null); // Set heading to default when menu appears
            }, 0);
        }
        if (introPrompt) {
            introPrompt.removeEventListener('click', handleIntroInteraction);
        }
    }

    const handleIntroInteraction = () => {
        if (introScreen && window.getComputedStyle(introScreen).display !== 'none' && introPrompt) {

            introPrompt.classList.add('button-active');


            playSound(audioIntroConfirm); // Play sound immediately
            setTimeout(() => {
                introPrompt.classList.remove('button-active');
                // CRT Hum is now started by powerOnEffect()
                hideIntroAndShowMenu();
            }, 1200);
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

        const introClickListener = (event) => {
            event.preventDefault();
            handleIntroInteraction();
        };
        introPrompt.addEventListener('click', introClickListener);
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
        updateMainHeading(targetId);
    }

    function showMenu() {
        // Hide all specific project views first
        if (projectDetailView) projectDetailView.classList.add('hidden');
        if (projectVideoView) projectVideoView.classList.add('hidden');
        if (projectSelectView) projectSelectView.classList.remove('hidden'); // Show select view when returning to projects section potentially

        // Hide all main sections
        sections.forEach(section => section.classList.remove('active-section'));

        // Show menu elements
        if (header) header.classList.remove('hidden');
        if (mainMenu) mainMenu.classList.remove('hidden');
        if (footer) footer.classList.add('visible');

        // Stop video if playing when returning to menu
        updateMainHeading(null); // Reset heading to default
        stopAndDestroyVideoPlayer();
    }

    // --- Header Update Logic ---
    function updateMainHeading(targetSectionId, explicitTitle = null) {
        if (!mainHeading) return; // Exit if heading element not found

        if (explicitTitle) { // If an explicit title is given, use it directly
            mainHeading.textContent = explicitTitle;
            return;
        }

        if (targetSectionId) { // If a specific section ID is provided
            const activeSection = document.querySelector(targetSectionId);
            if (activeSection) {
                const sectionTitleElement = activeSection.querySelector('h2');
                if (sectionTitleElement) {
                    mainHeading.textContent = sectionTitleElement.textContent; // Use section's H2 text
                } else {
                    mainHeading.textContent = "Berke Kaya"; // Fallback if H2 is missing
                }
            } else {
                mainHeading.textContent = "Berke Kaya"; // Fallback if section not found
            }
        } else { // If no section ID (means menu/intro is active)
            mainHeading.textContent = "Berke Kaya"; // Default text
        }
    }


    menuLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const button = event.currentTarget;
            const targetSectionId = button.getAttribute('href');

            if (targetSectionId && targetSectionId !== '#') {
                button.classList.add('button-active');
                playSound(audioButtonClick); // Play sound immediately
                setTimeout(() => {
                    button.classList.remove('button-active');
                    showSection(targetSectionId);
                }, 500);
            }
        });
    });

    // --- Back Button Logic (Revised) ---
    // General back buttons (excluding the one in projects section)
    backButtons.forEach(button => {
        // Skip the project section's back button, handle it separately
        if (projectsSection && projectsSection.contains(button)) {
            return;
        }
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const btn = event.currentTarget;
            btn.classList.add('button-active');
            playSound(audioButtonBack); // Play sound immediately
            setTimeout(() => {
                btn.classList.remove('button-active');
                showMenu(); // General back buttons always go to main menu
            }, 500);
        });
    });

    // Specific Back Button for Projects Section (Now in Detail View Footer)
    if (projectsBackButton) {
        projectsBackButton.addEventListener('click', (event) => {
            console.log("Back button clicked in project detail footer");
            event.preventDefault();
            const btn = event.currentTarget;
            btn.classList.add('button-active');
            playSound(audioButtonBack); // Play sound immediately
                setTimeout(() => {
                    btn.classList.remove('button-active');
                    showMenu();
            }, 500);
        });
    }

    if (projectsNavBackButton) {
        projectsNavBackButton.addEventListener('click', (event) => {
            console.log("Back button clicked in project detail footer");
            event.preventDefault();
            const btn = event.currentTarget;
            btn.classList.add('button-active');
            playSound(audioButtonBack); // Play sound immediately
            setTimeout(() => {
                projectsBackButton.classList.remove('hidden'); 
                btn.classList.remove('button-active');
                // Always go back to the project selection view from the detail view
                updateMainHeading(null, 'level select');
 
                 // Check which view is active within projects
                 if (projectVideoView && !projectVideoView.classList.contains('hidden')) {
                     // If video is showing, act like close button
                     closeVideoPlayer();
                 } else if (projectDetailView && !projectDetailView.classList.contains('hidden')) {
                     // If detail view is showing, go back to select view
                     projectDetailView.classList.add('hidden');
                     if (projectSelectView) projectSelectView.classList.remove('hidden');
                 }
                // Reset pagination for next time
                currentPage = 1;
                updatePageView(); // Ensure page 1 is active visually if detail view is reopened
            }, 500);
        });
    }



    const quitButton = document.getElementById('quit-button');
    if (quitButton) {
        quitButton.addEventListener('click', (event) => {
            event.preventDefault();
            const button = event.currentTarget;
            button.classList.add('button-active');
            playSound(audioPowerOff); // Play sound immediately
            setTimeout(() => { if (audioCrtHum) audioCrtHum.pause(); }, 1150);
            setTimeout(() => { playSound(audioPowerOnOff); }, 600);

            setTimeout(() => {
                button.classList.remove('button-active');

                // Use references obtained earlier
                if (screenWrapper && crtFrame) {
                    screenWrapper.classList.add('powering-off');
                    crtFrame.classList.add('powering-off'); // Apply to frame too if needed
                    setTimeout(() => {
                        screenWrapper.style.display = 'none';
                        powerOnButton.style.display = 'block'; // Show the power on button again
                    }, 750);
                }
            }, 800); // Keep button animation delay
        });
    }
    // --- Project Section Logic ---

    // Renders project buttons using the globally available projectsData
    function renderProjectSelection() {
        if (!projectSelectView) return;

        projectSelectView.innerHTML = ''; // Clear loading/previous buttons

        if (!projectsData || projectsData.length === 0) {
            projectSelectView.innerHTML = '<p>No projects available yet.</p>';
            console.log("No projects data found or empty.");
            return;
        }

        console.log("Rendering projects:", projectsData);

        projectsData.forEach(project => {
            const button = document.createElement('button');
            button.classList.add('retro-button', 'project-select-button');
            button.textContent = project.title;
            button.dataset.projectId = project.id;
            // TODO: Add thumbnail image logic later if needed

            button.addEventListener('click', (event) => {
                const btn = event.currentTarget;
                const projectId = btn.dataset.projectId;
                btn.classList.add('button-active');
                playSound(audioButtonClick); // Play sound immediately
                setTimeout(() => {
                    btn.classList.remove('button-active');
                    if (projectId) {
                        showProjectDetails(projectId);
                    }
                }, 500);
            });

            projectSelectView.appendChild(button);
        });
    }

    // --- Pagination Logic ---
    function updatePageView() {
        // Hide all pages
        [projectPageOverview, projectPageFullDescription, projectPageDetails, projectPageLinksMedia].forEach(page => {
            if (page) page.classList.remove('active-page');
        });

        // Show the current page
        let activePageElement;
        switch (currentPage) {
            case 1: activePageElement = projectPageOverview; break;
            case 2: activePageElement = projectPageFullDescription; break; // New Page 2
            case 3: activePageElement = projectPageDetails; break; // Old Page 2 is now Page 3
            case 4: activePageElement = projectPageLinksMedia; break; // Old Page 3 is now Page 4
        }
        if (activePageElement) {
            activePageElement.classList.add('active-page');
        }

        // Update indicator (dynamically using totalPages)
        if (pageIndicator) {
            pageIndicator.textContent = `${currentPage}/${totalPages}`;
        }

        // Update button states
        if (prevPageButton) {
            prevPageButton.disabled = (currentPage === 1);
        }
        if (nextPageButton) {
            nextPageButton.disabled = (currentPage === totalPages);
        }
    }

    if (nextPageButton) {
        nextPageButton.addEventListener('click', (event) => {
            if (currentPage < totalPages) {
                const btn = event.currentTarget;
                btn.classList.add('button-active');
                playSound(audioButtonClick); // Use standard click sound
                setTimeout(() => {
                     btn.classList.remove('button-active');
                     currentPage++;
                     updatePageView();
                }, 200); // Shorter delay for page turns
            }
        });
    }

    if (prevPageButton) {
        prevPageButton.addEventListener('click', (event) => {
            if (currentPage > 1) {
                 const btn = event.currentTarget;
                 btn.classList.add('button-active');
                 playSound(audioButtonClick); // Use back sound for previous
                 setTimeout(() => {
                     btn.classList.remove('button-active');
                     currentPage--;
                     updatePageView();
                 }, 200); // Shorter delay for page turns
            }
        });
    }


    function showProjectDetails(projectId) {
        // Access the globally loaded projectsData
        const project = projectsData.find(p => p.id === projectId);
        if (!project) {
            console.error(`Project with ID ${projectId} not found in loaded data.`);
            return;
        }
        // Ensure all required elements exist
        if (!projectDetailView || !projectSelectView || !projectDetailTitle || !projectDetailSummary || !projectDetailDescription ||
            !projectDetailStatus || !projectDetailPlatform || !projectDetailTech || !projectDetailFeatures ||
            !projectDetailLinks || !projectPlayButton || !projectPageNav || !projectPageOverview || !projectPageFullDescription ||
            !projectPageDetails || !projectPageLinksMedia) {
            console.error("Missing required elements for project detail view or its pages.");
            return;
        }

        // --- Populate Page 1: Overview ---
        projectDetailTitle.textContent = project.title || 'N/A';
        projectDetailSummary.textContent = project.summary || 'No summary available.'; // Populate new summary
        projectDetailStatus.textContent = project.status || 'N/A';

        // --- Populate Page 2: Full Description ---
        // The description element is now on this page, but the variable still points to it.
        projectDetailDescription.textContent = project.description || 'No description available.';

        // --- Populate Page 3: Details ---
        projectDetailPlatform.textContent = Array.isArray(project.platform) ? project.platform.join(', ') : 'N/A';
        projectDetailTech.textContent = Array.isArray(project.technologies) ? project.technologies.join(', ') : 'N/A';
        projectDetailFeatures.textContent = Array.isArray(project.features) ? project.features.join(', ') : 'N/A';

        // --- Populate Page 3: Links & Media ---
        // Clear previous links
        projectDetailLinks.innerHTML = '';
        if (Array.isArray(project.links) && project.links.length > 0) {
            project.links.forEach(link => {
                const linkElement = document.createElement('a');
                linkElement.href = link.url || '#';
                linkElement.textContent = link.name || 'Link';
                linkElement.target = '_blank'; // Open in new tab
                linkElement.rel = 'noopener noreferrer';
                linkElement.classList.add('retro-button', 'external-link'); // Add classes for styling
                projectDetailLinks.appendChild(linkElement);
                // Add spacing or breaks if needed, e.g., projectDetailLinks.appendChild(document.createElement('br'));
            });
        } else {
            projectDetailLinks.innerHTML = '<p>No additional links available.</p>';
        }

        // Store youtubeId for the play button
        projectPlayButton.dataset.youtubeId = project.youtubeId || '';

        // --- Setup Initial View ---
        updateMainHeading(null, project.title); // Update header with specific project title
        currentPage = 1; // Reset to first page
        updatePageView(); // Set initial page visibility and button states

        projectSelectView.classList.add('hidden');
        projectDetailView.classList.remove('hidden');
        // Ensure video view is hidden
        if (projectVideoView) projectVideoView.classList.add('hidden');

        projectsBackButton.classList.add('hidden'); // Hide the back button in the project selection view
    }

    // --- YouTube Video Handling ---

    function loadAndPlayVideo(youtubeId) {
        if (!youtubeApiReady) {
            console.log("YouTube API not ready yet, queuing video:", youtubeId);
            videoToLoad = youtubeId; // Queue the video ID
            return;
        }
        if (!youtubePlayerDiv) return;

        console.log("Loading YouTube video:", youtubeId);

        // Destroy previous player if exists
        stopAndDestroyVideoPlayer();

        try {
            ytPlayer = new YT.Player(youtubePlayerDiv.id, { // Use the div ID
                height: '100%', // Let CSS handle sizing via aspect-ratio
                width: '100%',
                videoId: youtubeId,
                playerVars: {
                    'playsinline': 1, // Important for mobile
                    'autoplay': 1,    // Autoplay when loaded
                    'controls': 1,    // Show controls
                    'rel': 0,         // Don't show related videos
                },
                events: {
                    'onReady': onPlayerReady,
                    // 'onStateChange': onPlayerStateChange // Optional: Add if needed
                }
            });
        } catch (error) {
            console.error("Error creating YouTube player:", error);
            if (projectVideoView) projectVideoView.classList.add('hidden'); // Hide if error
            if (projectDetailView) projectDetailView.classList.remove('hidden'); // Show details again
        }
    }

    function onPlayerReady(event) {
        console.log("YouTube Player Ready");
        event.target.playVideo(); // Start playing
    }

    // Optional: Handle state changes (e.g., video ended)
    // function onPlayerStateChange(event) {
    //     if (event.data == YT.PlayerState.ENDED) {
    //         closeVideoPlayer(); // Close when video ends, for example
    //     }
    // }

    function stopAndDestroyVideoPlayer() {
        if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
            ytPlayer.stopVideo();
        }
        if (ytPlayer && typeof ytPlayer.destroy === 'function') {
            ytPlayer.destroy();
        }
        ytPlayer = null;
        // Clear the div content in case the API didn't clean up fully
        if (youtubePlayerDiv) youtubePlayerDiv.innerHTML = '';
    }

    function closeVideoPlayer() {
        if (projectVideoView) projectVideoView.classList.add('hidden');
        stopAndDestroyVideoPlayer();
        // Show detail view again
        if (projectDetailView) projectDetailView.classList.remove('hidden');
        const activeSection = document.querySelector('main > section.active-section');
        updateMainHeading(null, projectDetailTitle.textContent); // Restore project title in header
        activeSection.style.zIndex = '';
    }

    // Event listeners moved to the end of DOMContentLoaded
    // --- Load YouTube API ---
    function loadYouTubeAPI() {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
    }

    // This function is called by the YouTube API script once loaded
    window.onYouTubeIframeAPIReady = function () {
        console.log("YouTube IFrame API Ready");
        youtubeApiReady = true;
        // If a video was queued, load it now
        if (videoToLoad) {
            loadAndPlayVideo(videoToLoad);
            videoToLoad = null; // Clear the queue
        }
    };


    // --- Function to Load Project Data ---
    async function loadProjectData() {
        try {
            const response = await fetch('projects.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            projectsData = await response.json(); // Assign fetched data to the global variable
            console.log("Projects data loaded:", projectsData);
            renderProjectSelection(); // Render buttons AFTER data is loaded
        } catch (error) {
            console.error("Could not load projects data:", error);
            if (projectSelectView) {
                projectSelectView.innerHTML = '<p>Error loading projects.</p>';
            }
        }
    }

    // --- Initial Calls ---
    loadProjectData(); // Load project data first, which then calls renderProjectSelection
    loadYouTubeAPI(); // Start loading the YouTube API


    // --- Power On Button Listener ---
    const powerOnButton = document.getElementById('power-on-button');
    // center the poweronbutton position to the screen
    function centerButtonInWrapper() {
        isScreenVisible = screenWrapper.style.display !== 'none';
        screenWrapper.style.display = 'block'; // Ensure wrapper is visible for calculations  
        const wrapperRect = screenWrapper.getBoundingClientRect(); // Gets position relative to viewport
        const buttonRect = powerOnButton.getBoundingClientRect();

        // Calculate desired top-left position relative to viewport
        // Adjust if wrapperRect coordinates are not relative to the same origin as button positioning
        const buttonTop = wrapperRect.top + window.scrollY + (wrapperRect.height / 2) - (buttonRect.height / 2);
        const buttonLeft = wrapperRect.left + window.scrollX + (wrapperRect.width / 2) - (buttonRect.width / 2);

        // Apply styles (ensure button has position: absolute or fixed in CSS)
        powerOnButton.style.position = 'absolute'; // Or 'fixed' - needs testing based on scroll behavior
        powerOnButton.style.left = `${buttonLeft}px`;
        powerOnButton.style.top = `${buttonTop}px`;
        powerOnButton.style.transform = ''; // Clear previous transform if it was used
        screenWrapper.style.display = isScreenVisible ? 'block': 'none'; // Hide wrapper again after positioning
    }

    // Run on load and resize
    window.addEventListener('load', centerButtonInWrapper);
    window.addEventListener('resize', centerButtonInWrapper);

    // Might need to run it after initial animations/transitions complete too
    // setTimeout(centerButtonInWrapper, 1000); // Example delay
    //

    if (powerOnButton) {
        powerOnButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default button behavior
            const button = event.currentTarget;
            button.classList.add('button-active');
            powerOnEffect(); // Call the power on function
            setTimeout(() => {
                button.classList.remove('button-active');
                powerOnButton.style.display = 'none'; // Hide the button after clicking
            }, 400); // Shorter delay for responsiveness
        });
    }


    // --- Event Listeners for Project Buttons ---

    if (projectPlayButton) {
        projectPlayButton.addEventListener('click', (event) => {
            const button = event.currentTarget;
            const youtubeId = button.dataset.youtubeId;
            const activeSection = document.querySelector('main > section.active-section');
            button.classList.add('button-active');
            playSound(audioProjectPlay); // Play sound immediately

            setTimeout(() => {
                button.classList.remove('button-active');
                if (youtubeId) {
                    if (projectDetailView) projectDetailView.classList.add('hidden');
                    if (projectVideoView) projectVideoView.classList.remove('hidden');
                    loadAndPlayVideo(youtubeId);
                } else {
                    console.error("No YouTube ID found for this project.");
                }
                activeSection.style.zIndex = '900';
            }, 1000);
        });
    }

    if (projectCloseVideoButton) {
        projectCloseVideoButton.addEventListener('click', (event) => {
            const button = event.currentTarget;
            button.classList.add('button-active');
            playSound(audioButtonBack); // Play sound immediately
            setTimeout(() => {
                button.classList.remove('button-active');
                closeVideoPlayer();
            }, 800);
        });
    }
});