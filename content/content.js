/**
 * Creates and injects the main habits reminder box into the page.
 * It handles the creation of the header, level selector, and habits container.
 * Also sets up event listeners and loads initial data.
 */
function createHabitsReminder() {
  // Check if reminder already exists and remove it to start fresh
  const existingReminder = document.querySelector('.chess-habits-reminder-box');
  if (existingReminder) {
    existingReminder.remove();
  }

  // Create reminder container with unique class name
  const reminderBox = document.createElement('div');
  reminderBox.className = 'chess-habits-reminder-box';

  // Create header
  const { header, dragHandle, minimizeButton, closeButton } = createHeaderElements();

  // Create level selector
  const { levelSelector, select } = createLevelSelectorElement();

  // Create habits container
  const habitsContainer = createHabitsContainerElement();

  // Add elements to the reminder box
  reminderBox.appendChild(header);
  reminderBox.appendChild(levelSelector);
  reminderBox.appendChild(habitsContainer);

  // Add to the page
  document.body.appendChild(reminderBox);

  // Event listeners for header buttons
  attachHeaderEventListeners(reminderBox, closeButton, minimizeButton);

  // Event listener for select element to update habits when level changes
  select.addEventListener('change', function() {
    updateHabitsForLevel(this.value);
    // Save selected level to storage
    browser.storage.sync.set({ selectedLevel: this.value });
  });

  // Make the reminder box draggable
  makeDraggable(reminderBox, dragHandle);

  // Load selected level from storage and update habits
  browser.storage.sync.get({selectedLevel: 'level1'}, function(result) {
    const selectedLevel = result.selectedLevel;
    select.value = selectedLevel;
    updateHabitsForLevel(selectedLevel);
  });

  // Restore position if saved
  browser.storage.sync.get({position: { top: '10px', left: '10px' }}, function(result) {
    if (result.position) {
      reminderBox.style.top = result.position.top;
      reminderBox.style.left = result.position.left;
      reminderBox.style.right = 'auto'; // Ensure this doesn't conflict with left positioning
    }
  });
}

/**
 * Creates the header elements for the reminder box.
 * Includes title, drag handle, minimize, and close buttons.
 * @returns {object} An object containing the header, dragHandle, minimizeButton, and closeButton elements.
 */
function createHeaderElements() {
  const header = document.createElement('div');
  header.className = 'chess-habits-header';

  const dragHandle = document.createElement('span');
  dragHandle.className = 'chess-habits-drag-handle';
  dragHandle.textContent = 'Chess Habits'; // Title of the reminder box

  const minimizeButton = document.createElement('button');
  minimizeButton.className = 'chess-habits-minimize-button';
  minimizeButton.textContent = '−'; // Minimize symbol
  minimizeButton.title = 'Minimize';

  const closeButton = document.createElement('button');
  closeButton.className = 'chess-habits-close-button';
  closeButton.textContent = '×'; // Close symbol
  closeButton.title = 'Close';

  header.appendChild(dragHandle);
  header.appendChild(minimizeButton);
  header.appendChild(closeButton);

  return { header, dragHandle, minimizeButton, closeButton };
}

/**
 * Creates the level selector dropdown element.
 * Populates options dynamically from ChessHabits.HABITS_DATA.
 * @returns {object} An object containing the levelSelector (div wrapper) and select (dropdown) elements.
 */
function createLevelSelectorElement() {
  const levelSelector = document.createElement('div');
  levelSelector.className = 'chess-habits-level-selector';

  const select = document.createElement('select');
  select.className = 'chess-habits-level-select';

  // Add options for each level from ChessHabits.HABITS_DATA
  if (ChessHabits && ChessHabits.HABITS_DATA) {
    Object.keys(ChessHabits.HABITS_DATA).forEach(levelKey => {
      const option = document.createElement('option');
      option.value = levelKey;
      option.textContent = ChessHabits.HABITS_DATA[levelKey].title; // Use title from data for display
      select.appendChild(option);
    });
  }

  levelSelector.appendChild(select);
  return { levelSelector, select };
}

/**
 * Creates the container element for displaying habits.
 * This is where individual habit outlines and details will be added.
 * @returns {HTMLElement} The habits container element (div).
 */
function createHabitsContainerElement() {
  const habitsContainer = document.createElement('div');
  habitsContainer.className = 'chess-habits-container';
  return habitsContainer;
}

/**
 * Attaches event listeners to the header buttons (close and minimize).
 * @param {HTMLElement} reminderBox - The main reminder box element.
 * @param {HTMLElement} closeButton - The close button element.
 * @param {HTMLElement} minimizeButton - The minimize button element.
 */
function attachHeaderEventListeners(reminderBox, closeButton, minimizeButton) {
  closeButton.addEventListener('click', function() {
    reminderBox.remove(); // Remove the reminder box from the DOM
  });

  minimizeButton.addEventListener('click', function() {
    reminderBox.classList.toggle('chess-habits-minimized'); // Toggle minimized state
    // Change button text based on state (+ for minimized, − for normal)
    minimizeButton.textContent = reminderBox.classList.contains('chess-habits-minimized') ? '+' : '−';
  });
}

/**
 * Updates the habits displayed in the reminder box based on the selected level.
 * Clears existing habits and populates new ones from ChessHabits.HABITS_DATA.
 * @param {string} level - The selected level key (e.g., "level1").
 */
function updateHabitsForLevel(level) {
  const reminderBox = document.querySelector('.chess-habits-reminder-box');
  if (!reminderBox) return; // Exit if reminder box is not found
  reminderBox.setAttribute('data-level', level); // Set data attribute for level-specific styling

  const habitsContainer = reminderBox.querySelector('.chess-habits-container');
  if (!habitsContainer) return; // Exit if habits container is not found

  // Clear existing habits before adding new ones
  habitsContainer.innerHTML = '';

  // Get habits data for the selected level
  const habits = ChessHabits.HABITS_DATA[level];
  if (!habits) {
    console.error("Level data not found:", level);
    return;
  }

  // Create and append habit elements (outline and details)
  habits.outlines.forEach((outline, index) => {
    const outlineElement = document.createElement('div');
    outlineElement.className = 'chess-habits-outline';
    outlineElement.textContent = outline;

    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'chess-habits-toggle-icon';
    toggleIcon.textContent = '▼'; // Down arrow for expandable
    outlineElement.appendChild(toggleIcon);

    const detailsElement = document.createElement('div');
    detailsElement.className = 'chess-habits-details';
    // Get corresponding detail if available, otherwise provide a default message
    detailsElement.textContent = (index < habits.details.length) ? habits.details[index] : 'No additional details available.';

    // Add click event to toggle visibility of details
    outlineElement.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent event from bubbling up, e.g., to drag handle
      this.classList.toggle('chess-habits-expanded');
      detailsElement.classList.toggle('chess-habits-visible');
    });

    habitsContainer.appendChild(outlineElement);
    habitsContainer.appendChild(detailsElement);
  });
}

/**
 * Makes a given HTML element draggable by its handle.
 * Allows the user to move the reminder box around the screen.
 * @param {HTMLElement} element - The element to make draggable (reminderBox).
 * @param {HTMLElement} handle - The specific part of the element that acts as a drag handle.
 */
function makeDraggable(element, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0; // Variables to store cursor positions

  handle.onmousedown = dragMouseDown; // Assign mousedown event to the handle

  // Function called when the mouse button is pressed down on the handle
  function dragMouseDown(e) {
    e.preventDefault(); // Prevent default browser action (e.g., text selection)
    // Get the initial mouse cursor position
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement; // Assign mouseup event to the document (stops dragging)
    document.onmousemove = elementDrag; // Assign mousemove event to the document (moves the element)
  }

  // Function called when the mouse cursor moves
  function elementDrag(e) {
    e.preventDefault();
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Set the element's new position
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }

  // Function called when the mouse button is released
  function closeDragElement() {
    // Stop moving when mouse button is released by removing event listeners
    document.onmouseup = null;
    document.onmousemove = null;

    // Save the final position to Chrome storage
    browser.storage.sync.set({
      position: {
        top: element.style.top,
        left: element.style.left
      }
    });
  }
}

/**
 * Initializes the extension.
 * Checks stored settings to determine if the reminder box should be created on the current page.
 * The reminder is only created on chess.com pages.
 */
function initialize() {
  // Check if the reminder should be shown based on stored settings
  browser.storage.sync.get({showReminder: true}, function(result) {
    const showReminder = result.showReminder;
    // Create reminder only if enabled and on a chess.com domain
    if (showReminder && window.location.hostname.includes('chess.com')) {
      // Delay creation slightly to ensure page elements are loaded
      setTimeout(function() {
        // Check if reminder box already exists (e.g. from previous navigation)
        if (!document.querySelector('.chess-habits-reminder')) {
          createHabitsReminder();
        }
      }, 1500);
    }
  });
}

// Run initialization when the page is fully loaded or if already loaded
if (document.readyState === 'complete') {
  initialize();
} else {
  window.addEventListener('load', initialize);
}

/**
 * Listens for messages from the popup script or other parts of the extension.
 * Handles actions like:
 * - "showReminder": Creates the reminder box.
 * - "updateLevel": Updates the displayed habits to a new level.
 * - "getSelectedLevel": Returns the currently selected level from the page or storage.
 */
browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  const reminderBox = document.querySelector('.chess-habits-reminder-box');
  const levelSelect = document.querySelector('.chess-habits-level-select');

  switch (message.action) {
    case "showReminder":
      createHabitsReminder();
      // Highlight the reminder box briefly after creation for user feedback
      setTimeout(function() {
        const currentReminderBox = document.querySelector('.chess-habits-reminder-box');
        if (currentReminderBox) {
          currentReminderBox.style.boxShadow = '0 0 0 3px #4285F4'; // Temporary highlight
          setTimeout(function() {
            currentReminderBox.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)'; // Restore original shadow
          }, 1000);
        }
      }, 100);
      break;
    case "updateLevel":
      // Update the level if the select element exists and a level is provided
      if (levelSelect && message.level) {
        levelSelect.value = message.level;
        updateHabitsForLevel(message.level);
      }
      break;
    case "getSelectedLevel":
      if (levelSelect) {
        sendResponse({ level: levelSelect.value });
      } else {
        // If reminder box (and thus select element) doesn't exist, get level from storage
        browser.storage.sync.get({selectedLevel: 'level1'}, function(result) {
          sendResponse({ level: result.selectedLevel });
        });
        return true; // Indicates that the response will be sent asynchronously
      }
      break;
  }
});
