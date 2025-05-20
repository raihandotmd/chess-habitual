// Create and inject the habits reminder box
function createHabitsReminder() {
    // Check if reminder already exists
    if (document.querySelector('.chess-habits-reminder')) {
        return;
    }

    // Create reminder container
    const reminderBox = document.createElement('div');
    reminderBox.className = 'chess-habits-reminder';

    // Create header with title and buttons
    const header = document.createElement('h2');

    const dragHandle = document.createElement('span');
    dragHandle.className = 'drag-handle';
    dragHandle.textContent = 'Chess Habits';

    const minimizeButton = document.createElement('button');
    minimizeButton.className = 'minimize-button';
    minimizeButton.textContent = '−';
    minimizeButton.title = 'Minimize';

    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = '×';
    closeButton.title = 'Close';

    header.appendChild(dragHandle);
    header.appendChild(minimizeButton);
    header.appendChild(closeButton);

    // Create habits list
    const habitsList = document.createElement('ul');

    // Add elements to the reminder box
    reminderBox.appendChild(header);
    reminderBox.appendChild(habitsList);

    // Add to the page
    document.body.appendChild(reminderBox);

    // Load habits from storage
    chrome.storage.sync.get(['habits', 'position'], function(result) {
        const habits = result.habits || [
            "Check for hanging pieces",
            "Look for opponent's threats",
            "Consider all checks and captures",
            "Think about pawn structure",
            "Evaluate piece activity"
        ];

        // Populate habits list
        habitsList.innerHTML = '';
        habits.forEach(habit => {
            const li = document.createElement('li');
            li.textContent = habit;
            habitsList.appendChild(li);
        });

        // Restore position if saved
        if (result.position) {
            reminderBox.style.top = result.position.top;
            reminderBox.style.right = result.position.right;
        }
    });

    // Event listeners
    closeButton.addEventListener('click', function() {
        reminderBox.remove();
    });

    minimizeButton.addEventListener('click', function() {
        reminderBox.classList.toggle('minimized');
        minimizeButton.textContent = reminderBox.classList.contains('minimized') ? '+' : '−';
    });

    // Make the reminder box draggable
    makeDraggable(reminderBox, dragHandle);
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
                right: element.style.right
            }
        });
    }
}

// Check if we should show the reminder
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


// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === "showReminder") {
    // Remove existing reminder if any
    const existingReminder = document.querySelector('.chess-habits-reminder');
    if (existingReminder) {
      existingReminder.remove();
    }
    
    // Create a new reminder
    createHabitsReminder();
    
    // Highlight it briefly to make it noticeable
    setTimeout(function() {
      const reminder = document.querySelector('.chess-habits-reminder');
      if (reminder) {
        reminder.style.boxShadow = '0 0 0 3px #4285F4';
        setTimeout(function() {
          reminder.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }, 1000);
      }
    }, 100);
  }
});
