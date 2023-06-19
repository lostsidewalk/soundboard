const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const yaml = require('js-yaml');

let soundboard;

function createWindow() {
  soundboard = new BrowserWindow({
    width: 625,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  soundboard.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true,
    })
  );

  // Expose the sounds array for access in the renderer process
  ipcMain.handle('getSoundEntries', () => {
    return configuration.sounds;
  });

  ipcMain.handle('getConfiguration', () => {
    return configuration;
  })

  // Handle the event when a sound button is clicked
  ipcMain.on('play-sound', (event, soundPath) => {
    // Play the sound here using your preferred method (e.g., Web Audio API or HTML5 <audio> element)
    console.log(`Playing sound: ${soundPath}`);
  });

  soundboard.on('closed', () => {
    soundboard = null;
  });
}

function loadConfiguration(filePath) {
  const fileExtension = path.extname(filePath);

  if (fileExtension === '.json') {
    const jsonData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData);
  } else if (fileExtension === '.yaml' || fileExtension === '.yml') {
    const yamlData = fs.readFileSync(filePath, 'utf8');
    return yaml.safeLoad(yamlData);
  } else {
    throw new Error('Unsupported configuration file format');
  }
}

// Define an array to store the sound entries
const configuration = loadConfiguration('soundboard-config.json');

if (app) {
  app.on('ready', createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
  
  app.on('activate', () => {
    if (soundboard === null) {
      createWindow();
    }
  });
}
