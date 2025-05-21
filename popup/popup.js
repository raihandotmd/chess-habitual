/* 
 * Chess.com Habits Reminder Extension
 * Popup script using consolidated data
 */

// DOM elements
const showReminderCheckbox = document.getElementById('show-reminder');
const showButton = document.getElementById('show-button');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(['showReminder', 'selectedLevel'], function(result) {
    const showReminder = result.showReminder !== undefined ? result.showReminder : true;
    showReminderCheckbox.checked = showReminder;
    
    // Set active tab based on selected level
    const selectedLevel = result.selectedLevel || 'level1';
    const tabToActivate = document.querySelector(`.tab-button[data-level="${selectedLevel}"]`);
    if (tabToActivate) {
      activateTab(tabToActivate);
    }
  });
}

// Toggle reminder visibility
function toggleReminder() {
  const showReminder = showReminderCheckbox.checked;
  chrome.storage.sync.set({ showReminder });
}

// Show the reminder on the current tab
function showReminder() {
  // Get the current active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const activeTab = tabs[0];
    
    // Check if we're on Chess.com
    if (activeTab.url && activeTab.url.includes('chess.com')) {
      // Send a message to the content script
      chrome.tabs.sendMessage(activeTab.id, {action: "showReminder"});
    } else {
      alert("Please navigate to Chess.com to show the reminder!");
    }
  });
}

// Activate a tab
function activateTab(tabButton) {
  // Remove active class from all buttons and contents
  tabButtons.forEach(btn => btn.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  // Add active class to clicked button and corresponding content
  tabButton.classList.add('active');
  const level = tabButton.getAttribute('data-level');
  document.getElementById(level + '-content').classList.add('active');
  
  // Save the selected level to storage
  chrome.storage.sync.set({ selectedLevel: level });
  
  // Notify content script about level change
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

// Function to create an expandable habit item
function createExpandableHabit(outline, detail, level, index) {
  const detailsId = `${level}-details-${index}`;
  
  // Create the outline element (all red now, including level4)
  const outlineElement = document.createElement('div');
  outlineElement.className = 'habit-outline';
  outlineElement.setAttribute('data-details', detailsId);
  
  // Add the outline text
  const outlineText = document.createElement('span');
  outlineText.textContent = outline;
  outlineElement.appendChild(outlineText);
  
  // Add the toggle icon
  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'toggle-icon';
  toggleIcon.textContent = '▼';
  outlineElement.appendChild(toggleIcon);
  
  // Create the details element (blue)
  const detailsElement = document.createElement('div');
  detailsElement.id = detailsId;
  detailsElement.className = 'habit-details';
  detailsElement.textContent = detail || 'No additional details available.';
  
  // Add click event to toggle details visibility
  outlineElement.addEventListener('click', () => {
    outlineElement.classList.toggle('expanded');
    detailsElement.classList.toggle('visible');
  });
  
  // Return both elements as a fragment
  const fragment = document.createDocumentFragment();
  fragment.appendChild(outlineElement);
  fragment.appendChild(detailsElement);
  
  return fragment;
}

// Function to populate a tab content with habits
function populateTabContent(level) {
  const contentElement = document.getElementById(`${level}-content`);
  
  // Clear existing content
  contentElement.innerHTML = '';
  
  // Check if we have custom habits
  chrome.storage.sync.get('customHabits', function(result) {
    const customHabits = result.customHabits || {};
    
    // Use custom habits if available, otherwise use default from data.js
    const habitsToUse = customHabits[level] || HABITS_DATA[level];
    
    if (!habitsToUse) {
      console.error("No habits data found for level:", level);
      return;
    }
    
    // Add each habit with its details
    habitsToUse.outlines.forEach((outline, index) => {
      const detail = index < habitsToUse.details.length ? habitsToUse.details[index] : null;
      const habitElement = createExpandableHabit(outline, detail, level, index);
      contentElement.appendChild(habitElement);
    });
  });
}

// Function to populate all tabs with habits
function populateAllTabs() {
  Object.keys(HABITS_DATA).forEach(level => {
    populateTabContent(level);
  });
}

// Initialize default settings if needed
function initializeSettings() {
  chrome.storage.sync.get(['showReminder', 'selectedLevel'], function(result) {
    if (result.showReminder === undefined) {
      chrome.storage.sync.set({ showReminder: true });
    }
    
    if (result.selectedLevel === undefined) {
      chrome.storage.sync.set({ selectedLevel: 'level1' });
    }
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Make sure HABITS_DATA is available
  if (typeof HABITS_DATA === 'undefined') {
    console.error("HABITS_DATA is not defined. The data.js file may not be loaded correctly.");
    document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Habits data not loaded. Please check the extension files.</div>';
    return;
  }
  
  initializeSettings();
  loadSettings();
  populateAllTabs();
  
  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      activateTab(button);
    });
  });
  
  // Other controls
  showReminderCheckbox.addEventListener('change', toggleReminder);
  showButton.addEventListener('click', showReminder);
});
