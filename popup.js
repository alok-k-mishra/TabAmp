document.addEventListener("DOMContentLoaded", () => {
    const volumeControls = document.getElementById("volumeControls");
  
    // Fetch all tabs
    chrome.tabs.query({}, (tabs) => {
      volumeControls.innerHTML = ""; // Clear loading text
  
      tabs.forEach((tab) => {
        if (tab.url) {
          const tabContainer = document.createElement("div");
          tabContainer.style.marginBottom = "10px";
  
          const tabLabel = document.createElement("span");
          tabLabel.textContent = tab.title.slice(0, 20) + "...";
          tabLabel.style.display = "block";
  
          const volumeSlider = document.createElement("input");
          volumeSlider.type = "range";
          volumeSlider.min = 0;
          volumeSlider.max = 100;
  
          // Load saved volume or set to default (100)
          chrome.storage.local.get([`volume_${tab.id}`], (result) => {
            volumeSlider.value = result[`volume_${tab.id}`] || 100;
          });
  
          // Change volume and save the setting
          volumeSlider.addEventListener("input", (event) => {
            const newVolume = event.target.value;
            chrome.storage.local.set({ [`volume_${tab.id}`]: newVolume });
  
            // Change volume using content script
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (volume) => {
                const audios = document.querySelectorAll("audio, video");
                audios.forEach((audio) => (audio.volume = volume / 100));
              },
              args: [newVolume],
            });
          });
  
          tabContainer.appendChild(tabLabel);
          tabContainer.appendChild(volumeSlider);
          volumeControls.appendChild(tabContainer);
        }
      });
    });
  });
  