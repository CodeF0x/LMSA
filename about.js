// Get DOM elements
const aboutButtonElement = document.getElementById('about-btn');
const aboutModal = document.getElementById('about-modal');
const closeAboutButton = document.getElementById('close-about');
const sidebarElement = document.getElementById('sidebar');
const modalContent = aboutModal ? aboutModal.querySelector('.modal-content') : null;
const openHelpLink = document.getElementById('open-help-link');
const helpModal = document.getElementById('help-modal');

// Function to close sidebar
function closeSidebar() {
    if (sidebarElement) {
        sidebarElement.classList.add('hidden');
        sidebarElement.classList.remove('active');
        document.body.classList.remove('sidebar-open');
    }
}

// About button click handler
if (aboutButtonElement) {
    aboutButtonElement.addEventListener('click', () => {
        // Close the sidebar first
        closeSidebar();
        
        // Then show the About modal
        if (aboutModal) {
            aboutModal.classList.remove('hidden');
            modalContent.classList.add('animate-modal-in');
            setTimeout(() => {
                modalContent.classList.remove('animate-modal-in');
            }, 300);
        }
    });
}

// Close About modal button handler
if (closeAboutButton) {
    closeAboutButton.addEventListener('click', () => {
        if (aboutModal) {
            modalContent.classList.add('animate-modal-out');
            setTimeout(() => {
                aboutModal.classList.add('hidden');
                modalContent.classList.remove('animate-modal-out');
            }, 300);
        }
    });
}

// Open help link click handler
if (openHelpLink && helpModal) {
    openHelpLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Close the about modal first
        if (aboutModal) {
            modalContent.classList.add('animate-modal-out');
            setTimeout(() => {
                aboutModal.classList.add('hidden');
                modalContent.classList.remove('animate-modal-out');
                
                // Then open the help modal
                helpModal.classList.remove('hidden');
                const helpModalContent = helpModal.querySelector('.modal-content');
                if (helpModalContent) {
                    helpModalContent.classList.add('animate-modal-in');
                    setTimeout(() => {
                        helpModalContent.classList.remove('animate-modal-in');
                    }, 300);
                }
            }, 300);
        }
    });
}