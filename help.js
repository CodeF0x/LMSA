document.addEventListener('DOMContentLoaded', () => {
    const helpBtn = document.getElementById('help-btn');
    const helpIconBtn = document.getElementById('help-icon-button');
    const helpModal = document.getElementById('help-modal');
    const closeHelpBtn = document.getElementById('close-help');
    const tutorialVideoBtn = document.getElementById('tutorial-video-btn');
    const sidebarElement = document.getElementById('sidebar');
    const modalContent = helpModal ? helpModal.querySelector('.modal-content') : null;
    
    // Function to close sidebar
    function closeSidebar() {
        if (sidebarElement) {
            sidebarElement.classList.add('hidden');
            sidebarElement.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        }
    }

    // Function to close help modal
    function closeHelpModal() {
        if (helpModal && modalContent) {
            modalContent.classList.add('animate-modal-out');
            setTimeout(() => {
                helpModal.classList.add('hidden');
                modalContent.classList.remove('animate-modal-out');
            }, 300);
        }
    }

    // Function to open help modal
    function openHelpModal() {
        if (helpModal && modalContent) {
            // Close the sidebar first
            closeSidebar();
            // Show the help modal
            helpModal.classList.remove('hidden');
            modalContent.classList.add('animate-modal-in');
            setTimeout(() => {
                modalContent.classList.remove('animate-modal-in');
            }, 300);
        }
    }

    // Event listeners
    if (helpBtn) {
        helpBtn.addEventListener('click', openHelpModal);
    }

    // Help icon button in header - ensure this listener works regardless of other elements
    if (helpIconBtn) {
        helpIconBtn.addEventListener('click', openHelpModal);
        console.log('Help icon button event listener attached');
    }

    // Only proceed with other modal functionality if required elements exist
    if (helpModal && closeHelpBtn) {
        if (closeHelpBtn) {
            closeHelpBtn.addEventListener('click', closeHelpModal);
        }

        // Tutorial video button event listener
        if (tutorialVideoBtn) {
            tutorialVideoBtn.addEventListener('click', () => {
                // Open YouTube video in external browser
                window.open('https://www.youtube.com/watch?v=qoXfa6In5BM&pp=ygUMbG1zYSBhbmRyb2lk', '_blank');
            });
        }

        // Close modal when clicking outside
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                closeHelpModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !helpModal.classList.contains('hidden')) {
                closeHelpModal();
            }
        });
    } else {
        console.warn('Some help modal elements are missing in the DOM');
    }
});
