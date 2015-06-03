function sanitizeMetadata(metadata) {
  metadata.modificationTime = new Date(metadata.modificationTime);
  return metadata;
}

function onGetMetadataRequested(options, onSuccess, onError) {
  console.log('onGetMetadataRequested', options.entryPath);

  if (options.entryPath === '/') {
    var root = {isDirectory: true, name: '', size: 0, modificationTime: new Date()};
    onSuccess(root);
    return;
  }

  chrome.storage.local.get(options.entryPath, function(localMetadata) {
    var metadata = localMetadata[options.entryPath];
    if (!metadata) {
      onError('NOT_FOUND');
    } else {
      // If no thumbnail is requested, make sure metadata don't include one.
      if (!options.thumbnail) {
        delete(metadata.thumbnail);
      }
      onSuccess(sanitizeMetadata(metadata));
    }
  });
}

function onReadDirectoryRequested(options, onSuccess, onError) {
  console.log('onReadDirectoryRequested', options.directoryPath);

  chrome.storage.local.get(null, function(localMetadata) {
    var entries = Object.keys(localMetadata).map(function(entryPath) {
      return sanitizeMetadata(localMetadata[entryPath]);
    });
    onSuccess(entries, false /* last call. */);
  });
}

// A map with currently opened files. As key it has requestId of
// openFileRequested and as a value the file path.
var openedFiles = {};

function onOpenFileRequested(options, onSuccess, onError) {
  console.log('onOpenFileRequested', options);
  if (options.mode != 'READ' || options.create) {
    onError('INVALID_OPERATION');
  } else {
    chrome.storage.local.get(null, function(metadata) {
      openedFiles[options.requestId] = options.filePath;
      onSuccess();
    });
  }
}

function onReadFileRequested(options, onSuccess, onError) {
  console.log('onReadFileRequested', options);
  chrome.storage.local.get(null, function(localMetadata) {
    var filePath = openedFiles[options.openRequestId];
    if (!filePath) {
      onError('SECURITY');
      return;
    }
    // TODO: Find out what is not working there...
    var arrayBuffer = dataURItoArrayBuffer(localMetadata[filePath].thumbnail);
    onSuccess(arrayBuffer.slice(options.offset, options.offset + options.length), false /* last call */);
  });
}

function onCloseFileRequested(options, onSuccess, onError) {
  console.log('onCloseFileRequested', options);
  if (!openedFiles[options.openRequestId]) {
    onError('INVALID_OPERATION');
    return;
  }

  delete openedFiles[options.openRequestId];
  onSuccess();
}


function onDeleteEntryRequested(options, onSuccess, onError) {
  console.log('onDeleteEntryRequested', options);

  chrome.storage.local.remove(options.entryPath, function() {
    onSuccess();
  })
}

function onUnmountRequested(options, onSuccess, onError) {
  console.log('onUnmountRequested', options);

  onSuccess();
  chrome.fileSystemProvider.unmount({ fileSystemId: options.fileSystemId });
}

function onMountRequested(onSuccess, onError) {
  console.log('onMountRequested');

  onSuccess();
  mountFileSystem();
}

function mountFileSystem() {
  var options = { fileSystemId: 'scan', displayName: 'Scan', writable: true };
  chrome.fileSystemProvider.mount(options);
}

function dataURItoArrayBuffer(dataURI) {
  var byteString = atob(dataURI.split(',')[1]);
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return ia.buffer;
}

function showWindow() {
  var options = {
    innerBounds: {width: 320, height: 160},
    resizable: false,
    frame: 'none',
    hidden: true,
  }
  chrome.app.window.create('window.html', options);
}

function onMessage(message) {
  if (message.action === 'mountFileSystem') {
    mountFileSystem();
  }
}


chrome.fileSystemProvider.onGetMetadataRequested.addListener(onGetMetadataRequested);
chrome.fileSystemProvider.onReadDirectoryRequested.addListener(onReadDirectoryRequested);
chrome.fileSystemProvider.onOpenFileRequested.addListener(onOpenFileRequested);
chrome.fileSystemProvider.onReadFileRequested.addListener(onReadFileRequested);
chrome.fileSystemProvider.onCloseFileRequested.addListener(onCloseFileRequested);
chrome.fileSystemProvider.onDeleteEntryRequested.addListener(onDeleteEntryRequested);
chrome.fileSystemProvider.onMountRequested.addListener(onMountRequested);
chrome.fileSystemProvider.onUnmountRequested.addListener(onUnmountRequested);

chrome.app.runtime.onLaunched.addListener(showWindow);
chrome.runtime.onMessage.addListener(onMessage);
