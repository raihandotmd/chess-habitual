/* 
 * Chess.com Habits Reminder Extension
 * Popup script for managing settings and displaying habits.
 */

// DOM elements
const showReminderCheckbox = document.getElementById('show-reminder'); // Checkbox to toggle reminder visibility
const showButton = document.getElementById('show-button'); // Button to manually show reminder
const tabButtons = document.querySelectorAll('.tab-button'); // All tab buttons (Level 1, Level 2, etc.)
const tabContents = document.querySelectorAll('.tab-content'); // All elements that contain tab content

/**
 * Loads extension settings (showReminder, selectedLevel) from Chrome storage
 * and updates the popup UI accordingly.
 */
function loadSettings() {
  chrome.storage.sync.get(['showReminder', 'selectedLevel'], function(result) {
    const showReminder = result.showReminder !== undefined ? result.showReminder : true; // Default to true if not set
    showReminderCheckbox.checked = showReminder;
    
    // Set active tab based on selected level
    const selectedLevel = result.selectedLevel || 'level1'; // Default to level1
    const tabToActivate = document.querySelector(`.tab-button[data-level="${selectedLevel}"]`);
    if (tabToActivate) {
      activateTab(tabToActivate);
    }
  });
}

/**
 * Toggles the visibility of the reminder on the page by updating the 'showReminder'
 * setting in Chrome storage. The content script listens for changes to this setting.
 */
function toggleReminder() {
  const showReminder = showReminderCheckbox.checked;
  chrome.storage.sync.set({ showReminder });
}

/**
 * Sends a message to the content script to show the reminder box on the current active tab.
 * Alerts the user if the current tab is not a Chess.com page.
 */
function showReminder() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const activeTab = tabs[0];
    // Check if the current tab is a Chess.com page
    if (activeTab.url && activeTab.url.includes('chess.com')) {
      // Send a message to the content script to trigger showing the reminder
      chrome.tabs.sendMessage(activeTab.id, {action: "showReminder"});
    } else {
      alert("Please navigate to Chess.com to show the reminder!");
    }
  });
}

/**
 * Activates a specific tab in the popup.
 * Updates the UI to show the selected tab's content and highlights the active tab button.
 * Saves the selected level to storage and notifies the content script of the change.
 * @param {HTMLElement} tabButton - The tab button element that was clicked.
 */
function activateTab(tabButton) {
  // Remove 'active' class from all tab buttons and content panes
  tabButtons.forEach(btn => btn.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  // Add 'active' class to the clicked button and its corresponding content pane
  tabButton.classList.add('active');
  const level = tabButton.getAttribute('data-level');
  document.getElementById(level + '-content').classList.add('active');
  
  // Save the newly selected level to storage
  chrome.storage.sync.set({ selectedLevel: level });
  
  // Notify content script about the level change
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const activeTab = tabs[0];
    if (activeTab.url && activeTab.url.includes('chess.com')) {
      chrome.tabs.sendMessage(activeTab.id, {
        action: "updateLevel",
        level: level
      });
    }
  });
}

/**
 * Creates an individual expandable habit item for the popup UI.
 * Each item consists of an outline (always visible) and details (toggleable).
 * @param {string} outline - The main text for the habit.
 * @param {string} detail - The detailed description of the habit.
 * @param {string} level - The level key (e.g., "level1") this habit belongs to.
 * @param {number} index - The index of the habit within its level, for creating unique IDs.
 * @returns {DocumentFragment} A document fragment containing the habit item elements (outline and details).
 */
function createExpandableHabit(outline, detail, level, index) {
  const detailsId = `${level}-details-${index}`; // Unique ID for the details element for ARIA or direct access
  
  // Create the outline element (visible part of the habit)
  const outlineElement = document.createElement('div');
  outlineElement.className = 'habit-outline';
  outlineElement.setAttribute('data-details', detailsId); // Link to details for toggling
  
  const outlineText = document.createElement('span');
  outlineText.textContent = outline;
  outlineElement.appendChild(outlineText);
  
  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'toggle-icon';
  toggleIcon.textContent = '▼'; // Down arrow icon
  outlineElement.appendChild(toggleIcon);
  
  // Create the details element (hidden by default)
  const detailsElement = document.createElement('div');
  detailsElement.id = detailsId;
  detailsElement.className = 'habit-details';
  detailsElement.textContent = detail || 'No additional details available.'; // Fallback text
  
  // Add click event to toggle details visibility
  outlineElement.addEventListener('click', () => {
    outlineElement.classList.toggle('expanded'); // Toggle state for styling icon
    detailsElement.classList.toggle('visible'); // Toggle visibility of details
  });
  
  // Use a DocumentFragment to efficiently append both elements
  const fragment = document.createDocumentFragment();
  fragment.appendChild(outlineElement);
  fragment.appendChild(detailsElement);
  
  return fragment;
}

/**
 * Populates a specific tab's content area with habits for the given level.
 * Fetches habit data from ChessHabits.HABITS_DATA.
 * @param {string} level - The level key (e.g., "level1") for which to populate habits.
 */
function populateTabContent(level) {
  const contentElement = document.getElementById(`${level}-content`); // Get the content container for the level
  
  // Clear any existing habits from the content element
  contentElement.innerHTML = '';
  
  // Get habits for the current level from the global ChessHabits data
  const habitsToUse = (ChessHabits && ChessHabits.HABITS_DATA) ? ChessHabits.HABITS_DATA[level] : undefined;
    
  if (!habitsToUse) {
    console.error("No habits data found for level:", level); // Log error if data is missing for the level
    return;
  }
    
  // Create and append each habit item to the content element
  habitsToUse.outlines.forEach((outline, index) => {
    const detail = index < habitsToUse.details.length ? habitsToUse.details[index] : null; // Get corresponding detail
    const habitElement = createExpandableHabit(outline, detail, level, index);
    contentElement.appendChild(habitElement);
  });
}

/**
 * Populates all tabs in the popup with their respective habits.
 * Iterates over the levels defined in ChessHabits.HABITS_DATA.
 */
function populateAllTabs() {
  if (ChessHabits && ChessHabits.HABITS_DATA) {
    Object.keys(ChessHabits.HABITS_DATA).forEach(level => { // Iterate over each level in the data
      populateTabContent(level); // Populate the tab for that level
    });
  }
}

/**
 * Initializes default extension settings in Chrome storage if they are not already set.
 * Sets 'showReminder' to true and 'selectedLevel' to 'level1' by default.
 */
function initializeSettings() {
  chrome.storage.sync.get(['showReminder', 'selectedLevel'], function(result) {
    // Set default for 'showReminder' if it's not defined
    if (result.showReminder === undefined) {
      chrome.storage.sync.set({ showReminder: true });
    }
    // Set default for 'selectedLevel' if it's not defined
    if (result.selectedLevel === undefined) {
      chrome.storage.sync.set({ selectedLevel: 'level1' });
    }
  });
}

/**
 * Sets up event listeners and initializes the popup when the DOM is fully loaded.
 * - Checks for data availability from `data.js`.
 * - Initializes default settings if necessary.
 * - Loads current settings and updates the UI.
 * - Populates all habit tabs.
 * - Sets up event listeners for tab switching and other controls.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Ensure that the habit data is available from data.js
  if (typeof ChessHabits === 'undefined' || typeof ChessHabits.HABITS_DATA === 'undefined') {
    console.error("ChessHabits.HABITS_DATA is not defined. The data.js file may not be loaded correctly.");
    // Display an error message in the popup if data is missing
    document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Habits data not loaded. Please check the extension files.</div>';
    return; // Stop further execution if data is not available
  }
  
  initializeSettings(); // Set up default settings if not already present
  loadSettings();       // Load current settings into the UI
  populateAllTabs();    // Fill tabs with habit data
  
  // Event listener for tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      activateTab(button);
    });
  });
  
  // Event listeners for other controls
  showReminderCheckbox.addEventListener('change', toggleReminder);
  showButton.addEventListener('click', showReminder);
});
