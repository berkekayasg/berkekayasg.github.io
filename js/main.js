// Project data will be loaded from projects.json
document.addEventListener('DOMContentLoaded', () => {
    // Variable to hold fetched project data
    let projectsData = [];

    // --- Element References ---
    const introScreen = document.getElementById('intro-screen');
    const introPrompt = document.getElementById('intro-prompt');
    const header = document.querySelector('header');
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
    const projectPlayButton = document.getElementById('project-play-button');
    const projectVideoView = document.getElementById('project-video-view');
    const projectCloseVideoButton = document.getElementById('project-close-video-button');
    const youtubePlayerDiv = document.getElementById('youtube-player'); // The div for the iframe
    const projectsBackButton = projectsSection ? projectsSection.querySelector('.back-button') : null; // Specific back button for projects

    // --- YouTube Player API ---
    let ytPlayer = null; // Variable to hold the YouTube player instance
    let youtubeApiReady = false;
    let videoToLoad = null; // Store video ID if API isn't ready yet

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
        stopAndDestroyVideoPlayer();
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
            setTimeout(() => {
                btn.classList.remove('button-active');
                showMenu(); // General back buttons always go to main menu
            }, 800);
        });
    });

    // Specific Back Button for Projects Section
    if (projectsBackButton) {
        projectsBackButton.addEventListener('click', (event) => {
            event.preventDefault();
            const btn = event.currentTarget;
            btn.classList.add('button-active');

            setTimeout(() => {
                btn.classList.remove('button-active');

                // Check which view is active within projects
                if (projectVideoView && !projectVideoView.classList.contains('hidden')) {
                    // If video is showing, act like close button
                    closeVideoPlayer();
                } else if (projectDetailView && !projectDetailView.classList.contains('hidden')) {
                    // If detail view is showing, go back to select view
                    projectDetailView.classList.add('hidden');
                    if (projectSelectView) projectSelectView.classList.remove('hidden');
                } else {
                    // Otherwise (select view is showing), go back to main menu
                    showMenu();
                }
            }, 800);
        });
    }



    const quitButton = document.getElementById('quit-button');
    if (quitButton) {
        quitButton.addEventListener('click', (event) => {
            event.preventDefault();
            const button = event.currentTarget;
            button.classList.add('button-active');

            setTimeout(() => {
                button.classList.remove('button-active');

                // Use references obtained earlier
                if (screenWrapper && crtFrame) {
                    screenWrapper.classList.add('powering-off');
                    crtFrame.classList.add('powering-off'); // Apply to frame too if needed
                    setTimeout(() => {
                        screenWrapper.style.display = 'none';
                    }, 750);
                }
            }, 800);
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
                setTimeout(() => {
                    btn.classList.remove('button-active');
                    if (projectId) {
                        showProjectDetails(projectId);
                    }
                }, 800);
            });

            projectSelectView.appendChild(button);
        });
    }

    function showProjectDetails(projectId) {
        // Access the globally loaded projectsData
        const project = projectsData.find(p => p.id === projectId);
        if (!project) {
            console.error(`Project with ID ${projectId} not found in loaded data.`);
            return;
        }
        if (!projectDetailView || !projectSelectView || !projectDetailTitle || !projectDetailDescription) return;

        projectDetailTitle.textContent = project.title;
        projectDetailDescription.textContent = project.description;
        // Store youtubeId for the play button
        if (projectPlayButton) {
            projectPlayButton.dataset.youtubeId = project.youtubeId;
        }


        projectSelectView.classList.add('hidden');
        projectDetailView.classList.remove('hidden');
        // Ensure video view is hidden
        if (projectVideoView) projectVideoView.classList.add('hidden');
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
                    'rel': 0,          // Don't show related videos
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
    }

    // Event listeners moved to the end of DOMContentLoaded
    // --- Load YouTube API ---
    function loadYouTubeAPI() {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
    }

    // This function is called by the YouTube API script once loaded
    window.onYouTubeIframeAPIReady = function() {
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


    // --- Event Listeners for Project Buttons ---

    if (projectPlayButton) {
        projectPlayButton.addEventListener('click', (event) => {
            const button = event.currentTarget;
            const youtubeId = button.dataset.youtubeId;
            button.classList.add('button-active');

            setTimeout(() => {
                 button.classList.remove('button-active');
                 if (youtubeId) {
                    if (projectDetailView) projectDetailView.classList.add('hidden');
                    if (projectVideoView) projectVideoView.classList.remove('hidden');
                    loadAndPlayVideo(youtubeId);
                 } else {
                    console.error("No YouTube ID found for this project.");
                 }
            }, 800);
        });
    }

    if (projectCloseVideoButton) {
        projectCloseVideoButton.addEventListener('click', (event) => {
             const button = event.currentTarget;
             button.classList.add('button-active');
             setTimeout(() => {
                 button.classList.remove('button-active');
                 closeVideoPlayer();
             }, 800);
        });
    }
});