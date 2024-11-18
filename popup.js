// Function to check which tabs are currently making sound
function updateTabList() {
    // Query all tabs
    chrome.tabs.query({}, function(tabs) {
      const volumeControls = document.getElementById('volumeControls');
      volumeControls.innerHTML = ''; // Clear existing content
  
      // Loop through the tabs and check if they are audible
      tabs.forEach(function(tab) {
        if (tab.audible) { // Only show tabs making sound
          // Create a container for each tab's volume control
          const tabDiv = document.createElement('div');
          tabDiv.classList.add('tab');
          
          // Add the tab title (if available)
          const tabTitle = document.createElement('span');
          tabTitle.textContent = tab.title || 'Untitled Tab';
          tabDiv.appendChild(tabTitle);
  
          // Create a range input (slider) for volume control
          const volumeSlider = document.createElement('input');
          volumeSlider.type = 'range';
          volumeSlider.min = 0;
          volumeSlider.max = 1;
          volumeSlider.step = 0.01;
          volumeSlider.value = 0.5; // Default volume
  
          // Add event listener to adjust volume on slider change
          volumeSlider.addEventListener('input', function() {
            chrome.tabs.update(tab.id, { muted: volumeSlider.value == 0 });
          });
  
          // Append the slider to the tab container
          tabDiv.appendChild(volumeSlider);
  
          // Append this tab's container to the popup
          volumeControls.appendChild(tabDiv);
        }
      });
    });
  }
  
  // Listen for when the popup is opened
  document.addEventListener('DOMContentLoaded', function() {
    updateTabList(); // Initial call to populate the tab list
  
    // Recheck tab list whenever there is a change (e.g., tab is muted/unmuted)
    chrome.tabs.onUpdated.addListener(function() {
      updateTabList();
    });
  });
  