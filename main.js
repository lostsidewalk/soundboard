const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const yaml = require('js-yaml');
const Ajv = require('ajv');

const ajv = new Ajv();
const soundboardSchema = require('./soundboard-schema.json');

let soundboard;
let configuration;

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

  // Expose the sound entries and configuration for access in the renderer process
  ipcMain.handle('getSoundEntries', () => {
    return configuration.sounds;
  });

  ipcMain.handle('getConfiguration', () => {
    return configuration;
  });

  ipcMain.handle('saveConfiguration', (event, configContent) => {
    return saveConfiguration(configContent);
  });

  ipcMain.handle('revertConfiguration', () => {
    return loadConfiguration('soundboard-config.json');
  });

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

function saveConfiguration(configContent) {
  const filePath = 'soundboard-config.json';

  try {
    // Validate the configuration content
    const parsedConfig = JSON.parse(configContent);

    // Ensure the parsed configuration has the required structure or perform additional validation checks
    if (!isValidConfiguration(parsedConfig)) {
      throw new Error('Invalid configuration format');
    }

    // Write the configuration content to the file
    fs.writeFileSync(filePath, configContent, 'utf8');

    // Reload the configuration from the updated file
    configuration = loadConfiguration(filePath);

    return true; // Indicate successful save
  } catch (error) {
    console.error('Error saving configuration: ', error);

    // Return the error message to the renderer process
    return error.message;
  }
}

function isValidConfiguration(config) {
  const validate = ajv.compile(soundboardSchema);
  const valid = validate(config);

  if (!valid) {
    console.error('Invalid configuration: ', validate.errors);
  }

  return valid;
}

// Load the initial configuration
configuration = loadConfiguration('soundboard-config.json');

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
