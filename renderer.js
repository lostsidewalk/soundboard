const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const soundboardTab = document.getElementById('soundboardTab');
  const configTab = document.getElementById('configTab');
  const soundboardContent = document.getElementById('soundboardContent');
  const configContent = document.getElementById('configContent');
  const configTextArea = document.getElementById('configTextArea');
  const saveButton = document.getElementById('saveButton');
  const revertButton = document.getElementById('revertButton');
  const configErrorContainer = document.getElementById('configErrorContainer');

  soundboardTab.addEventListener('click', () => {
    soundboardContent.style.display = 'block';
    configContent.style.display = 'none';
    soundboardTab.classList.add('active');
    configTab.classList.remove('active');
  });

  configTab.addEventListener('click', () => {
    soundboardContent.style.display = 'none';
    configContent.style.display = 'block';
    soundboardTab.classList.remove('active');
    configTab.classList.add('active');
  });

  function reloadSoundEntries() {
    soundboardContent.innerHTML = '';
    // Retrieve sound entries from the main process
    ipcRenderer.invoke('getSoundEntries').then((soundEntries) => {
      soundEntries.forEach((sound) => {
        const button = document.createElement('button');
        button.textContent = sound.name;

        button.addEventListener('click', () => {
          console.log(`Playing sound: ${sound.name}`);
          playSound(sound.file);
        });

        soundboardContent.appendChild(button);
      });
    });
  }

  // Function to play the sound
  function playSound(soundPath) {
    // Create an audio element
    const audio = new Audio(soundPath);

    // Play the audio
    audio.play()
      .then(() => {
        console.log('Sound playback started');
      })
      .catch((error) => {
        alert('Error playing sound:' + error);
      });
  }

  saveButton.addEventListener('click', () => {
    configErrorContainer.textContent = ''; // Clear the error message
    try {
      const configContent = JSON.parse(configTextArea.value);
      const validationResult = isValidConfiguration(configContent);

      if (validationResult === true) {
        // Configuration is valid, proceed with saving
        console.log('Saving configuration: ', JSON.stringify(configContent));
        ipcRenderer.invoke('saveConfiguration', JSON.stringify(configContent)).then(() => {
          configErrorContainer.textContent = 'Configuration saved successfully';
          reloadSoundEntries();
        }).catch((error) => {
          configErrorContainer.textContent = 'Error saving configuration: ' + error;
        });
      } else {
        // Configuration is invalid, display the error message
        configErrorContainer.textContent = 'Invalid configuration';
      }
    } catch (error) {
      // Configuration is invalid, display the error message
      configErrorContainer.textContent = 'Error parsing configuration: ' + error;
    }
  });

  revertButton.addEventListener('click', () => {
    configErrorContainer.textContent = ''; // Clear the error message
    ipcRenderer.invoke('revertConfiguration').then((configuration) => {
      const pp = JSON.stringify(configuration, null, 4);
      configTextArea.value = pp;
      configErrorContainer.textContent = 'Configuration reverted to the original';
      reloadSoundEntries();
    }).catch((error) => {
      configErrorContainer.textContent = 'Error reverting configuration: ' + error;
    });
  });

  // Set the initial active tab
  soundboardTab.click();

  reloadSoundEntries();

  ipcRenderer.invoke('getConfiguration').then((configuration) => {
    const pp = JSON.stringify(configuration, null, 4);
    configTextArea.value = pp;
  });
});
