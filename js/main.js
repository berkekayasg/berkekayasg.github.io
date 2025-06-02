// Project data will be loaded from projects.json
document.addEventListener('DOMContentLoaded', () => {
    // Variable to hold fetched project data
    let projectsData = [];
    let colorModeBeforeVideo = null; // To store color mode before video plays

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
    const projectDetailTimeline = document.getElementById('project-detail-timeline'); // Added for project dates
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


    // Settings Section Elements
    const settingSaveButton = document.getElementById('setting-save');
    const settingResetButton = document.getElementById('setting-reset');
    // Settings Navigation & View Elements
    const settingsNavDisplay = document.getElementById('settings-nav-display');
    const settingsNavAudio = document.getElementById('settings-nav-audio');
    const settingsDisplayView = document.getElementById('settings-display-view');
    const settingsAudioView = document.getElementById('settings-audio-view');
    const allSettingsViews = [settingsDisplayView, settingsAudioView]; // Helper array
    const allSettingsNavButtons = [settingsNavDisplay, settingsNavAudio]; // Helper array


    // --- Settings Logic ---
    const SETTINGS_STORAGE_KEY = 'berkeKayaPortfolioSettings';

    // Define constants for settings
    const COLOR_MODES = ['full-color', 'monochrome', 'green-phosphor', 'amber-phosphor'];
    const COLOR_MODE_NAMES = { // For display
        'full-color': 'Full Color',
        'monochrome': 'Monochrome',
        'green-phosphor': 'Green Phosphor',
        'amber-phosphor': 'Amber Phosphor'
    };
    const SETTING_CONFIG = {
        brightness: { min: 50, max: 150, step: 10 },
        contrast: { min: 50, max: 150, step: 10 },
        masterVolume: { min: 0, max: 100, step: 10 },
        sfxVolume: { min: 0, max: 100, step: 10 },
        colorMode: { modes: COLOR_MODES, names: COLOR_MODE_NAMES }
    };
const INITIAL_SOUND_VOLUMES = {
        'audio-crt-hum': 0.45,
        'audio-intro-confirm': 0.8,
        'audio-button-click': 0.7,
        'audio-button-back': 0.75,
        'audio-project-play': 1,
        'audio-power-off': 0.8,
        'audio-power-on': 1,
        'audio-power-on-off': 0.8
    };


    const defaultSettings = {
        brightness: 100,
        contrast: 100,
        colorMode: 'full-color',
        masterVolume: 100,
        sfxVolume: 100
    };

    let currentSettings = { ...defaultSettings }; // Working copy

    // Function to apply settings visually and functionally (remains largely the same)
    function applySettings(settings) {
        // --- Apply Visual Settings ---
        // Color Mode (using body classes for CSS targeting)
        document.body.classList.remove('color-mode-monochrome', 'color-mode-green-phosphor', 'color-mode-amber-phosphor');
        let colorFilter = ''; // Base filter string for color mode
        if (settings.colorMode === 'monochrome') {
            document.body.classList.add('color-mode-monochrome');
            colorFilter = 'grayscale(100%)';
        } else if (settings.colorMode === 'green-phosphor') {
            document.body.classList.add('color-mode-green-phosphor');
            // Adjusted green phosphor filter values slightly
            colorFilter = 'grayscale(100%) sepia(100%) hue-rotate(60deg) saturate(300%) brightness(90%)';
        } else if (settings.colorMode === 'amber-phosphor') {
            document.body.classList.add('color-mode-amber-phosphor');
             // Adjusted amber phosphor filter values slightly
            colorFilter = 'grayscale(100%) sepia(100%) hue-rotate(-35deg) saturate(400%) brightness(95%)';
        }
        // Else: full-color, no class, no base color filter

        // Combine color filter with brightness and contrast
        if (screenWrapper) {
            // Construct the full filter string
            const brightnessFilter = `brightness(${settings.brightness}%)`;
            const contrastFilter = `contrast(${settings.contrast}%)`;
            // Combine: color filter first, then brightness/contrast
            const combinedFilter = `${colorFilter} ${brightnessFilter} ${contrastFilter}`.trim();
            screenWrapper.style.filter = combinedFilter;
        }


        // --- Apply Audio Settings ---
        // Master Volume
        const masterVolValue = settings.masterVolume / 100;
        [audioCrtHum, audioIntroConfirm, audioButtonClick, audioButtonBack, audioProjectPlay, audioPowerOff, audioPowerOn, audioPowerOnOff].forEach(audio => {
            if (audio) {
                // Get or set the sound's specific initial/base volume from INITIAL_SOUND_VOLUMES
                let soundInitialVolume = parseFloat(audio.dataset.soundInitialVolume); // Using a new attribute name for clarity
                if (isNaN(soundInitialVolume)) { // If not already cached on the element
                    soundInitialVolume = INITIAL_SOUND_VOLUMES[audio.id];
                    if (typeof soundInitialVolume !== 'number' || isNaN(soundInitialVolume) || soundInitialVolume < 0 || soundInitialVolume > 1) {
                        console.warn(`Initial volume for ${audio.id} not found or invalid in INITIAL_SOUND_VOLUMES (value: ${INITIAL_SOUND_VOLUMES[audio.id]}), defaulting to 0.7. Ensure it's a number between 0.0 and 1.0.`);
                        soundInitialVolume = 0.7; // Default if not specified or invalid
                    }
                    audio.dataset.soundInitialVolume = soundInitialVolume; // Cache it on the element
                }

                // Apply master volume relative to this sound's specific initial volume
                audio.volume = Math.max(0, Math.min(1, soundInitialVolume * masterVolValue));
            }
        });
        // SFX Volume is handled within playSound

        console.log("Applied settings:", settings);
    }

    // Function to update the display value for a specific setting
    function updateSettingDisplay(settingKey) {
        const displayElement = document.getElementById(`${settingKey}-value`); // Assumes ID convention from HTML changes
        if (!displayElement || !currentSettings) return;

        const config = SETTING_CONFIG[settingKey];
        let displayValue = '';

        if (settingKey === 'colorMode') {
            displayValue = config.names[currentSettings.colorMode] || currentSettings.colorMode;
        } else {
            // Ensure the key exists in currentSettings before accessing it
            const value = currentSettings[settingKey] !== undefined ? currentSettings[settingKey] : defaultSettings[settingKey];
            displayValue = `${value}%`;
        }
        displayElement.textContent = displayValue;
    }


    // Function to update ALL settings UI controls (now uses updateSettingDisplay)
    function updateSettingControls(settings) {
        // Iterate through the keys in SETTING_CONFIG to update all displays
        Object.keys(SETTING_CONFIG).forEach(key => {
            updateSettingDisplay(key);
        });
        // Note: We no longer set .value for sliders/selects here
    }


    // Function to save settings to localStorage (remains the same)
    function saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
            console.log("Settings saved:", settings);
        } catch (error) {
            console.error("Failed to save settings:", error);
        }
    }

    // Function to load settings from localStorage
    function loadSettings() {
        let loadedSettings = { ...defaultSettings }; // Start with defaults
        try {
            const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                // Merge saved settings with defaults to ensure all keys exist
                loadedSettings = { ...defaultSettings, ...parsedSettings };
            }
        } catch (error) {
            console.error("Failed to load settings, using defaults:", error);
        }
        currentSettings = loadedSettings; // Update working copy
        applySettings(currentSettings);
        updateSettingControls(currentSettings);
        console.log("Settings loaded:", currentSettings);
    }

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
    // Added ignoreSfxVolume flag for sounds like save confirmation
    function playSound(audioElement, ignoreSfxVolume = false) {
        if (audioElement && currentSettings) {
            audioElement.currentTime = 0; // Reset playback

            // Get the sound's specific initial volume (should be cached by applySettings)
            let soundInitialVolume = parseFloat(audioElement.dataset.soundInitialVolume);
            if (isNaN(soundInitialVolume)) {
                // Fallback: try to get directly from config if not cached (e.g., if playSound is called before applySettings for some reason)
                soundInitialVolume = INITIAL_SOUND_VOLUMES[audioElement.id];
                if (typeof soundInitialVolume !== 'number' || isNaN(soundInitialVolume) || soundInitialVolume < 0 || soundInitialVolume > 1) {
                    console.warn(`Initial volume for ${audioElement.id} not found/invalid in playSound (value: ${INITIAL_SOUND_VOLUMES[audioElement.id]}), defaulting to 0.7. Ensure it's a number between 0.0 and 1.0.`);
                    soundInitialVolume = 0.7;
                }
                audioElement.dataset.soundInitialVolume = soundInitialVolume; // Cache it now
            }

            const masterVolFactor = currentSettings.masterVolume / 100;
            let sfxVolFactor = 1.0; // Default: no SFX modification

            // Check if this sound is an SFX sound and if SFX volume should be applied
            const sfxSounds = [audioIntroConfirm, audioButtonClick, audioButtonBack, audioProjectPlay, audioPowerOff, audioPowerOn, audioPowerOnOff];
            if (!ignoreSfxVolume && sfxSounds.includes(audioElement)) {
                sfxVolFactor = currentSettings.sfxVolume / 100;
            }

            // Calculate final volume based on its initial volume, master volume, and SFX volume (if applicable)
            const finalVolume = soundInitialVolume * masterVolFactor * sfxVolFactor;
            audioElement.volume = Math.max(0, Math.min(1, finalVolume));

            audioElement.play().catch(error => console.error("Audio play failed:", error));
        } else if (!audioElement) {
            console.warn("playSound called with null audioElement");
        }
    }

    // --- Date Formatting Helper ---
    function formatProjectDate(dateString) {
        if (!dateString || dateString.toLowerCase() === 'present') {
            return 'Present';
        }
        const parts = dateString.split('-');
        if (parts.length !== 3) {
            return dateString; // Return original if format is unexpected
        }
        const day = parts[0] == "00" ? "" : parts[0];
        const monthIndex = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS Date
        const year = parts[2];

        const monthNames = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"];

        if (monthIndex >= 0 && monthIndex < 12) {
            return `${day} ${monthNames[monthIndex]} ${year}`;
        }
        return dateString; // Fallback for invalid month
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
                }, 300); // Shorter delay for page turns
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
                 }, 300); // Shorter delay for page turns
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
            !projectPageDetails || !projectPageLinksMedia || !projectDetailTimeline) { // Added projectDetailTimeline check
            console.error("Missing required elements for project detail view or its pages.");
            return;
        }

        // --- Populate Page 1: Overview ---
        projectDetailTitle.textContent = project.title || 'N/A';
        projectDetailSummary.textContent = project.summary || 'No summary available.'; // Populate new summary
        projectDetailStatus.textContent = project.status || 'N/A';

        // New: Populate Timeline
        if (projectDetailTimeline) { // Check if the element exists
            const startDateFormatted = formatProjectDate(project.startDate);
            const endDateFormatted = formatProjectDate(project.endDate);
            if (project.startDate && project.endDate) {
                projectDetailTimeline.textContent = `${startDateFormatted} - ${endDateFormatted}`;
            } else if (project.startDate) {
                projectDetailTimeline.textContent = `${startDateFormatted} - Present`; // Or handle as needed
            } else {
                projectDetailTimeline.textContent = 'N/A';
            }
        }

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

        // GoatCounter: Track project detail view
        if (window.goatcounter && typeof window.goatcounter.count === 'function') {
            window.goatcounter.count({
                path: '/project/' + project.id, // Using project.id for a unique path
                title: project.title + ' - Project Detail', // Optional: provide a custom title
                event: true // Mark as an event for virtual page views
            });
        }
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

        // Restore original color mode if it was changed
        if (colorModeBeforeVideo !== null) {
            currentSettings.colorMode = colorModeBeforeVideo;
            applySettings(currentSettings); // Apply the restored settings
            colorModeBeforeVideo = null; // Reset the temporary storage
        }

        // Show detail view again
        if (projectDetailView) projectDetailView.classList.remove('hidden');
        const activeSection = document.querySelector('main > section.active-section');
        updateMainHeading(null, projectDetailTitle.textContent); // Restore project title in header
        if (activeSection) { // Check if activeSection exists before setting zIndex
             activeSection.style.zIndex = '';
        }
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
                    // Store current color mode and set to default before playing video
                    if (currentSettings.colorMode !== 'full-color') {
                        colorModeBeforeVideo = currentSettings.colorMode;
                        currentSettings.colorMode = 'full-color';
                        applySettings(currentSettings); // Apply 'full-color' mode
                    } else {
                        colorModeBeforeVideo = null; // Ensure it's null if already full color
                    }

                    if (projectDetailView) projectDetailView.classList.add('hidden');
                    if (projectVideoView) projectVideoView.classList.remove('hidden');
                    loadAndPlayVideo(youtubeId);
                } else {
                    console.error("No YouTube ID found for this project.");
                }
                if (activeSection) { // Check if activeSection exists before setting zIndex
                    activeSection.style.zIndex = '900';
                }
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
    // --- Settings View Switching ---
    function switchSettingsView(targetViewId) {
        setTimeout(() => {
            allSettingsViews.forEach(view => {
                if (view) {
                    view.classList.toggle('active-settings-view', view.id === targetViewId);
                }
            });
            allSettingsNavButtons.forEach(button => {
                if (button) {
                    const targetType = targetViewId.replace('settings-', '').replace('-view', '');
                    const isActive = (button.id === `settings-nav-${targetType}`);
                    button.classList.toggle('active-tab', isActive);
                }
            });
        }, 300);
         playSound(audioButtonClick); // Reuse button click sound
    }

    if (settingsNavDisplay) {
        settingsNavDisplay.addEventListener('click', () => switchSettingsView('settings-display-view'));
    }
    if (settingsNavAudio) {
        settingsNavAudio.addEventListener('click', () => switchSettingsView('settings-audio-view'));
    }
    // --- Settings Event Listeners (New Button Logic) ---

    // Function to handle changes from the new '<' and '>' buttons
    function handleSettingChange(settingKey, direction) {
        if (!currentSettings) return;
        const config = SETTING_CONFIG[settingKey];
        if (!config) {
            console.error("Invalid setting key:", settingKey);
            return;
        }
        let changed = false;

        if (settingKey === 'colorMode') {
            const currentIndex = config.modes.indexOf(currentSettings.colorMode);
            let nextIndex = currentIndex + direction;
            // Wrap around logic
            if (nextIndex < 0) {
                nextIndex = config.modes.length - 1;
            } else if (nextIndex >= config.modes.length) {
                nextIndex = 0;
            }
            // Update if index actually changed
            if (nextIndex !== currentIndex) {
                currentSettings.colorMode = config.modes[nextIndex];
                changed = true;
            }
        } else { // Handle numeric settings (Volume, Brightness, Contrast)
            const currentValue = currentSettings[settingKey];
            let newValue = currentValue + (config.step * direction);
            newValue = Math.max(config.min, Math.min(config.max, newValue)); // Clamp value

            if (newValue !== currentValue) {
                currentSettings[settingKey] = newValue;
                changed = true;
            }
        }

        if (changed) {
            updateSettingDisplay(settingKey);
            applySettings(currentSettings); // Apply change immediately
            playSound(audioButtonClick); // Play feedback sound
        }
    }

    // Add event listeners to all new setting buttons
    document.querySelectorAll('.setting-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const btn = event.currentTarget;
            const settingKey = btn.dataset.setting;
            const direction = parseInt(btn.dataset.direction, 10);

            if (!settingKey || isNaN(direction)) {
                console.error("Missing data-setting or data-direction on button:", btn);
                return;
            }

            // Add button active visual feedback
            btn.classList.add('button-active');
            setTimeout(() => btn.classList.remove('button-active'), 200); // Short visual feedback

            handleSettingChange(settingKey, direction);
        });
    });

    // Save Button (remains the same)
    if (settingSaveButton) {
        settingSaveButton.addEventListener('click', (event) => {
            const btn = event.currentTarget;
            btn.classList.add('button-active');
            playSound(audioButtonClick);
            setTimeout(() => {
                 btn.classList.remove('button-active');
                 applySettings(currentSettings); // Ensure all settings are applied
                 saveSettings(currentSettings); // Save the current state
            }, 200); // Short delay for button feedback
        });
    }

    // Reset Button
    if (settingResetButton) {
        settingResetButton.addEventListener('click', (event) => {
             const btn = event.currentTarget;
             btn.classList.add('button-active');
             playSound(audioButtonClick);
             setTimeout(() => {
                 btn.classList.remove('button-active');
                //  if (confirm("Reset all settings to default?")) { // Confirmation dialog
                     currentSettings = { ...defaultSettings }; // Reset working copy
                     applySettings(currentSettings);
                     updateSettingControls(currentSettings);
                     saveSettings(currentSettings); // Save the defaults
                //  }
             }, 200); // Short delay
        });
    }
    loadSettings(); 
});