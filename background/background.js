// This is a minimal background script
// You can expand it if you need additional functionality

// Listen for installation
chrome.runtime.onInstalled.addListener(function() {
  // Initialize default settings
  chrome.storage.sync.get(['habits', 'showReminder'], function(result) {
    if (!result.habits) {
      chrome.storage.sync.set({
        habits: [
          "Check for hanging pieces",
          "Look for opponent's threats",
          "Consider all checks and captures",
          "Think about pawn structure",
          "Evaluate piece activity"
        ]
      });
    }
    
    if (result.showReminder === undefined) {
      chrome.storage.sync.set({ showReminder: true });
    }
  });
});
