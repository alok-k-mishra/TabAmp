document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup Loaded");
  console.log("Chrome Storage API:", chrome.storage); // Debug log
  console.log("Chrome Storage Local:", chrome.storage.local); // Debug log

  const volumeControls = document.getElementById("volumeControls");

  chrome.tabs.query({}, (tabs) => {
    console.log("Tabs Retrieved:", tabs); // Debug log
    volumeControls.innerHTML = ""; // Clear loading text

    tabs.forEach((tab) => {
      if (tab.url && tab.audible) {
        const tabContainer = document.createElement("div");
        tabContainer.style.marginBottom = "10px";

        const tabLabel = document.createElement("span");
        tabLabel.textContent = tab.title.slice(0, 20) + "...";
        tabLabel.style.display = "block";

        const volumeSlider = document.createElement("input");
        volumeSlider.type = "range";
        volumeSlider.min = 0;
        volumeSlider.max = 100;

        console.log(`Loading volume for Tab ID: ${tab.id}`); // Debug log
        if (chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(`volume_${tab.id}`, (result) => {
            if (chrome.runtime.lastError) {
              console.error("Storage error:", chrome.runtime.lastError);
              volumeSlider.value = 100; // Default to 100
            } else {
              console.log(`Volume for Tab ${tab.id}:`, result);
              volumeSlider.value = result[`volume_${tab.id}`] || 100;
            }
          });
        } else {
          console.error("Storage API is not accessible!");
        }

        volumeSlider.addEventListener("input", (event) => {
          const newVolume = event.target.value;
          if (chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ [`volume_${tab.id}`]: newVolume }, () => {
              if (chrome.runtime.lastError) {
                console.error("Error saving volume for tab", tab.id, chrome.runtime.lastError);
              }
            });
          }

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
