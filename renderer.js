const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const soundboardTab = document.getElementById('soundboardTab');
  const configTab = document.getElementById('configTab');
  const soundboardContent = document.getElementById('soundboardContent');
  const configContent = document.getElementById('configContent');
  const configTextArea = document.getElementById('configTextArea');
  const saveButton = document.getElementById('saveButton');
  const revertButton = document.getElementById('revertButton');

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

  saveButton.addEventListener('click', () => {
    const configContent = configTextArea.value;
    // TODO: Implement saving the config content to the file system
    console.log('Saving configuration:', configContent);
  });

  revertButton.addEventListener('click', () => {
    // TODO: Implement reverting the config content to the original configuration file
    console.log('Reverting configuration');
  });

  // Set the initial active tab
  soundboardTab.click();

  // Retrieve sound entries from the main process
  ipcRenderer.invoke('getSoundEntries').then((soundEntries) => {
    soundEntries.forEach((sound) => {
      const button = document.createElement('button');
      button.textContent = sound.name;

      button.addEventListener('click', () => {
        console.log(`Playing sound: ${sound.name}`);
        // TODO: Implement your logic to play the sound here
      });

      soundboardContent.appendChild(button);
    });
  });

  ipcRenderer.invoke('getConfiguration').then((configuration) => {
    let pp = JSON.stringify(configuration, null, 4);
    configTextArea.value = pp;
  })
});
