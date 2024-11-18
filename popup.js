// Function to check which tabs are currently making sound
function updateTabList() {
  // Query all tabs
  chrome.tabs.query({}, function(tabs) {
    const volumeControls = document.getElementById('volumeControls');
    volumeControls.innerHTML = ''; // Clear existing content

    // Filter for audible tabs
    const audibleTabs = tabs.filter(tab => tab.audible);

    // Limit to 4 tabs for display if there are more
    const tabsToShow = audibleTabs.slice(0, 4);

    tabsToShow.forEach(function(tab) {
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
      volumeSlider.value = tab.muted ? 0 : 1; // Set initial value based on muted state

      // Add event listener to adjust mute state on slider change
      volumeSlider.addEventListener('input', function() {
        const isMuted = volumeSlider.value == 0;
        chrome.tabs.update(tab.id, { muted: isMuted }, function() {
          if (chrome.runtime.lastError) {
            console.error(`Error updating tab ${tab.id}: ${chrome.runtime.lastError.message}`);
          }
        });
      });

      // Append the slider to the tab container
      tabDiv.appendChild(volumeSlider);

      // Append this tab's container to the popup
      volumeControls.appendChild(tabDiv);
    });

    // Show scrollbar if there are more than 4 audible tabs
    if (audibleTabs.length > 4) {
      volumeControls.style.maxHeight = '300px';
      volumeControls.style.overflowY = 'auto';
    } else {
      volumeControls.style.maxHeight = 'none';
      volumeControls.style.overflowY = 'hidden';
    }
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