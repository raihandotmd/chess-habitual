// Create and inject the habits reminder box
function createHabitsReminder() {
    // Check if reminder already exists and remove it to start fresh
    const existingReminder = document.querySelector('.chess-habits-reminder-box');
    if (existingReminder) {
        existingReminder.remove();
    }

    // Create reminder container with unique class name
    const reminderBox = document.createElement('div');
    reminderBox.className = 'chess-habits-reminder-box';

    // Create header with title and buttons
    const header = document.createElement('div');
    header.className = 'chess-habits-header';

    const dragHandle = document.createElement('span');
    dragHandle.className = 'chess-habits-drag-handle';
    dragHandle.textContent = 'Chess Habits';

    const minimizeButton = document.createElement('button');
    minimizeButton.className = 'chess-habits-minimize-button';
    minimizeButton.textContent = '−';
    minimizeButton.title = 'Minimize';

    const closeButton = document.createElement('button');
    closeButton.className = 'chess-habits-close-button';
    closeButton.textContent = '×';
    closeButton.title = 'Close';

    header.appendChild(dragHandle);
    header.appendChild(minimizeButton);
    header.appendChild(closeButton);

    // Create level selector
    const levelSelector = document.createElement('div');
    levelSelector.className = 'chess-habits-level-selector';

    const select = document.createElement('select');
    select.className = 'chess-habits-level-select';

    // Add options for each level
    const levels = [
        { value: 'level1', text: 'LEVEL 1 | 0-700' },
        { value: 'level2', text: 'LEVEL 2 | 700-1100' },
        { value: 'level3', text: 'LEVEL 3 | 1100-1550' },
        { value: 'level4', text: 'LEVEL 4 | 1550-2000+' }
    ];

    levels.forEach(level => {
        const option = document.createElement('option');
        option.value = level.value;
        option.textContent = level.text;
        select.appendChild(option);
    });

    levelSelector.appendChild(select);

    // Create habits container
    const habitsContainer = document.createElement('div');
    habitsContainer.className = 'chess-habits-container';

    // Add elements to the reminder box
    reminderBox.appendChild(header);
    reminderBox.appendChild(levelSelector);
    reminderBox.appendChild(habitsContainer);

    // Add to the page
    document.body.appendChild(reminderBox);

    // Event listeners
    closeButton.addEventListener('click', function() {
        reminderBox.remove();
    });

    minimizeButton.addEventListener('click', function() {
        reminderBox.classList.toggle('chess-habits-minimized');
        minimizeButton.textContent = reminderBox.classList.contains('chess-habits-minimized') ? '+' : '−';
    });

    select.addEventListener('change', function() {
        updateHabitsForLevel(this.value);

        // Save selected level to storage
        chrome.storage.sync.set({ selectedLevel: this.value });
    });

    // Make the reminder box draggable
    makeDraggable(reminderBox, dragHandle);

    // Load selected level from storage and update habits
    chrome.storage.sync.get('selectedLevel', function(result) {
        const selectedLevel = result.selectedLevel || 'level1';
        select.value = selectedLevel;
        updateHabitsForLevel(selectedLevel);
    });

    // Restore position if saved
    chrome.storage.sync.get('position', function(result) {
        if (result.position) {
            reminderBox.style.top = result.position.top;
            reminderBox.style.left = result.position.left;
            reminderBox.style.right = 'auto';
        }
    });
}

// Update habits display for the selected level
function updateHabitsForLevel(level) {
    document.querySelector('.chess-habits-reminder-box').setAttribute('data-level', level);
  
    const habitsContainer = document.querySelector('.chess-habits-container');
    if (!habitsContainer) return;

    // Clear existing habits
    habitsContainer.innerHTML = '';

    // Get habits data for the selected level
    // Check if HABITS_DATA is available from data.js
    if (typeof HABITS_DATA === 'undefined') {
        console.error("HABITS_DATA is not defined. Using fallback data.");
        // Use fallback data
        updateHabitsWithFallbackData(level, habitsContainer);
        return;
    }

    const habits = HABITS_DATA[level];
    if (!habits) {
        console.error("Level data not found:", level);
        return;
    }

    // Create habits list
    habits.outlines.forEach((outline, index) => {
        // Create outline element
        const outlineElement = document.createElement('div');
        outlineElement.className = 'chess-habits-outline';
        outlineElement.textContent = outline;

        // Add toggle icon
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'chess-habits-toggle-icon';
        toggleIcon.textContent = '▼';
        outlineElement.appendChild(toggleIcon);

        // Create details element
        const detailsElement = document.createElement('div');
        detailsElement.className = 'chess-habits-details';

        // Get corresponding detail if available
        if (index < habits.details.length) {
            detailsElement.textContent = habits.details[index];
        } else {
            detailsElement.textContent = 'No additional details available.';
        }

        // Add click event to toggle details
        outlineElement.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering drag
            this.classList.toggle('chess-habits-expanded');
            detailsElement.classList.toggle('chess-habits-visible');
        });

        // Add to container
        habitsContainer.appendChild(outlineElement);
        habitsContainer.appendChild(detailsElement);
    });
}

// Fallback data function in case HABITS_DATA is not available
function updateHabitsWithFallbackData(level, container) {
    const fallbackData = {
        level1: {
            outlines: ["NO PREMOVES", "NO TACTICS", "NO GAMBITS", "NO SACRIFICES"],
            details: [
                "KNOW HOW ALL PIECES MOVE",
                "CONTROL AND MOVE TOWARDS CENTER",
                "CASTLE ASAP & ALWAYS TRADE PIECES",
                "DON'T HANG FREE PIECES & TAKE FREE PIECES",
                "ACTIVATE KING IN ENDGAME & ATTACK PAWNS"
            ]
        }
    };

    // Use level1 as fallback for all levels
    const habits = fallbackData.level1;

    // Create habits list
    habits.outlines.forEach((outline, index) => {
        // Create outline element
        const outlineElement = document.createElement('div');
        outlineElement.className = 'chess-habits-outline';
        outlineElement.textContent = outline;

        // Add toggle icon
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'chess-habits-toggle-icon';
        toggleIcon.textContent = '▼';
        outlineElement.appendChild(toggleIcon);

        // Create details element
        const detailsElement = document.createElement('div');
        detailsElement.className = 'chess-habits-details';

        // Get corresponding detail if available
        if (index < habits.details.length) {
            detailsElement.textContent = habits.details[index];
        } else {
            detailsElement.textContent = 'No additional details available.';
        }

        // Add click event to toggle details
        outlineElement.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering drag
            this.classList.toggle('chess-habits-expanded');
            detailsElement.classList.toggle('chess-habits-visible');
        });

        // Add to container
        container.appendChild(outlineElement);
        container.appendChild(detailsElement);
    });

    // Add a message about the fallback
    const fallbackMessage = document.createElement('div');
    fallbackMessage.className = 'chess-habits-fallback-message';
    fallbackMessage.textContent = 'Using fallback data. Please reload the extension.';
    container.appendChild(fallbackMessage);
}

// Make an element draggable
function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e.preventDefault();
        // Get mouse position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Call function whenever the cursor moves
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        // Calculate new position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // Set element's new position
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        element.style.right = 'auto';
    }

    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;

        // Save position
        chrome.storage.sync.set({
            position: {
                top: element.style.top,
                left: element.style.left
            }
        });
    }
}

// Initialize the extension
function initialize() {
    // Create reminder if enabled
    chrome.storage.sync.get('showReminder', function(result) {
        const showReminder = result.showReminder !== undefined ? result.showReminder : true;

        if (showReminder && window.location.hostname.includes('chess.com')) {
            setTimeout(function() {
                if (!document.querySelector('.chess-habits-reminder')) {
                    createHabitsReminder();
                }
            }, 1500);

        }
    });
}

// Run initialization when the page is fully loaded
if (document.readyState === 'complete') {
    initialize();
} else {
    window.addEventListener('load', initialize);
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === "showReminder") {
        createHabitsReminder();

        // Highlight it briefly
        setTimeout(function() {
            const reminder = document.querySelector('.chess-habits-reminder-box');
            if (reminder) {
                reminder.style.boxShadow = '0 0 0 3px #4285F4';
                setTimeout(function() {
                    reminder.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                }, 1000);
            }
        }, 100);
    } else if (message.action === "updateLevel") {
        // Update the level when changed from popup
        const select = document.querySelector('.chess-habits-level-select');
        if (select && message.level) {
            select.value = message.level;
            updateHabitsForLevel(message.level);
        }
    } else if (message.action === "getSelectedLevel") {
        const select = document.querySelector('.chess-habits-level-select');
        if (select) {
            sendResponse({ level: select.value });
        } else {
            // If reminder box doesn't exist, get from storage
            chrome.storage.sync.get('selectedLevel', function(result) {
                sendResponse({ level: result.selectedLevel || 'level1' });
            });
            return true; // Required for async response
        }
    }
});
