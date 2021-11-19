const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const webp = require('webp-converter');

// Enable permissions for webp
webp.grant_permission();

// Script variables
let mainWindow = null;
let selectedFiles = null;
let selectedOutputDirectory = null;
let useOutputFolder = null;

let disableOutputFolderCheckbox = true;

if (require('electron-squirrel-startup')) {
  app.quit();
}

/**
 * Creates the main window.
 */
const createWindow = () => {
  const windowTitle = `Webp Image Converter | Running NodeJS Version ${process.versions.node}`;

  mainWindow = new BrowserWindow({
    title: windowTitle,
    width: 650,
    height: 400,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  //mainWindow.webContents.openDevTools();
}

// Once the application is ready, create the window.
app.on('ready', createWindow);

// If all the windows are closed, terminate the program.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/**
 * Called when the upload button is clicked.
 */
ipcMain.on('upload-button-clicked', event => {
  dialog.showOpenDialog({
    title: 'Select images to upload',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] },
      { name: 'All', extensions: ['*'] }
    ]
  })
  .then(selected => {
    if(!selected.canceled) {
      selectedFiles = selected.filePaths;
      selectedOutputDirectory = selectedOutputDirectory === null ? path.dirname(selectedFiles[0]) : selectedOutputDirectory;
      disableOutputFolderCheckbox = false;

      event.reply('selected-files', selectedFiles, selectedOutputDirectory, disableOutputFolderCheckbox);
    }
  })
  .catch(error => console.log(error));
});

/**
 * Called when the output location button is clicked.
 */
ipcMain.on('output-location-button-clicked', event => {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  .then(selected => {
    if(!selected.canceled) {
      selectedOutputDirectory = selected.filePaths;
      disableOutputFolderCheckbox = false;
      
      event.reply('selected-output-directory', selectedOutputDirectory, disableOutputFolderCheckbox);
    }
  })
  .catch(error => console.log(error));
});

/**
 * Called when the convert files button is clicked.
 */
ipcMain.on('convert-files-button-clicked', event => {
  if(selectedFiles === null) {
    mainWindow.webContents.send('alert-no-files-selected');
    return;
  } else if(selectedOutputDirectory === null) {
    mainWindow.webContents.send('alert-no-directory-selected');
    return;
  }

  convertFiles();
});

/**
 * Helper function that iterates over all of the selected images,
 * and converts them into the .webp format.
 */
const convertFiles = async () => {
  let numConverted = 0;
  
  for(const file of selectedFiles) {
    const dirName = path.dirname(file);
    const fileExt = path.extname(file);
    const fileName = path.basename(file, fileExt);
    
    const inputFile = `${dirName}/${fileName}${fileExt}`;
    const outputDir = `${selectedOutputDirectory}${useOutputFolder ? '/output' : ''}/${fileName}.webp`;

    await webp.cwebp(inputFile, outputDir, '-q 5', logging='-v');
    numConverted++;
    mainWindow.webContents.send('conversion-progress-update', numConverted);
  }
  
  mainWindow.webContents.send('conversion-complete', numConverted);
}

/**
 * Called when the use output folder checkbox is toggled.
 */
ipcMain.on('output-folder-checkbox-changed', (event, uof) => {
  
});
