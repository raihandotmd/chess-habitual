// Default habits
const DEFAULT_HABITS = [
  "Check for hanging pieces",
  "Look for opponent's threats",
  "Consider all checks and captures",
  "Think about pawn structure",
  "Evaluate piece activity"
];

// DOM elements
const habitsList = document.getElementById('habits-list');
const newHabitInput = document.getElementById('new-habit');
const addHabitButton = document.getElementById('add-habit');
const showReminderCheckbox = document.getElementById('show-reminder');
const showButton = document.getElementById('show-button');
const resetHabitsButton = document.getElementById('reset-habits');

// Load habits from storage
function loadHabits() {
  chrome.storage.sync.get(['habits', 'showReminder'], function(result) {
    const habits = result.habits || DEFAULT_HABITS;
    const showReminder = result.showReminder !== undefined ? result.showReminder : true;
    
    renderHabitsList(habits);
    showReminderCheckbox.checked = showReminder;
  });
}

// Render habits list
function renderHabitsList(habits) {
  habitsList.innerHTML = '';
  
  habits.forEach((habit, index) => {
    const habitItem = document.createElement('div');
    habitItem.className = 'habit-item';
    
    const habitText = document.createElement('span');
    habitText.textContent = habit;
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-habit';
    deleteButton.textContent = '×';
    deleteButton.addEventListener('click', () => deleteHabit(index));
    
    habitItem.appendChild(habitText);
    habitItem.appendChild(deleteButton);
    habitsList.appendChild(habitItem);
  });
}

// Add a new habit
function addHabit() {
  const newHabit = newHabitInput.value.trim();
  
  if (newHabit) {
    chrome.storage.sync.get('habits', function(result) {
      const habits = result.habits || DEFAULT_HABITS;
      habits.push(newHabit);
      
      chrome.storage.sync.set({ habits }, function() {
        renderHabitsList(habits);
        newHabitInput.value = '';
      });
    });
  }
}

// Delete a habit
function deleteHabit(index) {
  chrome.storage.sync.get('habits', function(result) {
    const habits = result.habits || DEFAULT_HABITS;
    habits.splice(index, 1);
    
    chrome.storage.sync.set({ habits }, function() {
      renderHabitsList(habits);
    });
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
    if (activeTab.url.includes('chess.com')) {
      // Send a message to the content script
      chrome.tabs.sendMessage(activeTab.id, {action: "showReminder"});
    } else {
      alert("Please navigate to Chess.com to show the reminder!");
    }
  });
}

// Reset habits to default
function resetHabits() {
  if (confirm("Are you sure you want to reset all habits to default?")) {
    chrome.storage.sync.set({ habits: DEFAULT_HABITS }, function() {
      renderHabitsList(DEFAULT_HABITS);
    });
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadHabits);
addHabitButton.addEventListener('click', addHabit);
newHabitInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') addHabit();
});
showReminderCheckbox.addEventListener('change', toggleReminder);
showButton.addEventListener('click', showReminder);
resetHabitsButton.addEventListener('click', resetHabits);

