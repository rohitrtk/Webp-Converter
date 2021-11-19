const { ipcRenderer } = require('electron');

const bUpload               = document.getElementById('upload-button');
const liUploadFiles         = document.getElementById('uploaded-files');
const bSelectOutputLocation = document.getElementById('output-location-button');
const lbOutputLocation      = document.getElementById('output-location-label');
const bConvertFiles         = document.getElementById('convert-files-button');
const pConvertFiles         = document.getElementById('conversion-progress');
const cbUseOutputFolder     = document.getElementById('use-output-folder-checkbox');

let numFiles = 0;
let useOutputFolder = false;

bUpload.addEventListener('click', () => ipcRenderer.send('upload-button-clicked'));
bSelectOutputLocation.addEventListener('click', () => ipcRenderer.send('output-location-button-clicked'));
bConvertFiles.addEventListener('click', () => ipcRenderer.send('convert-files-button-clicked'));
cbUseOutputFolder.addEventListener('change', () => ipcRenderer.send('output-folder-checkbox-changed', cbUseOutputFolder.checked));

ipcRenderer.on('selected-files', (event, files, directory) => {
  numFiles = files.length;

  for(const file of files) {
    const li = document.createElement('li');
    li.innerHTML = file;
    liUploadFiles.appendChild(li);
  }

  lbOutputLocation.innerHTML = directory;
});

ipcRenderer.on('selected-output-directory', (event, directory) => {
  lbOutputLocation.innerHTML = directory;
});

ipcRenderer.on('conversion-progress-update', (event, numConvertedFiles) => {
  numConvertedFiles = parseInt(numConvertedFiles);
  const conversionPercentage = numConvertedFiles / numFiles * 100;
  pConvertFiles.style.width = `${conversionPercentage}%`;
});

ipcRenderer.on('conversion-complete', (event, numConvertedFiles) => {
  numConvertedFiles = parseInt(numConvertedFiles);
  setTimeout(() => {
    alert(`Successfully converted ${numConvertedFiles}/${numFiles} images!`);
  }, 1);
});

ipcRenderer.on('alert-no-files-selected', (event, args) => {
  alert('No files selected!');
});

ipcRenderer.on('alert-no-directory-selected', (event, args) => {
  alert('No directory selected!');
});

ipcRenderer.on('alert=no-directory-checkbox', (event, args) => {
  
})
