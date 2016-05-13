const FILE_SYSTEM_ID = 'scan';

function sanitizeMetadata(metadata, options) {
  metadata.modificationTime = new Date(metadata.modificationTime);
  if (options) {
    if (!options.name) { delete metadata.name; }
    if (!options.thumbnail) { delete(metadata.thumbnail); }
    if (!options.size) { delete(metadata.size); }
    if (!options.mimeType) { delete(metadata.mimeType); }
    if (!options.modificationTime) { delete(metadata.modificationTime); }
    if (!options.isDirectory) { delete(metadata.isDirectory); }
  }
  return metadata;
}

function onGetMetadataRequested(options, onSuccess, onError) {
  console.log('onGetMetadataRequested', options);

  if (options.entryPath === '/') {
    var root = {isDirectory: true, name: '', size: 0, modificationTime: new Date()};
    onSuccess(sanitizeMetadata(root, options));
    return;
  }

  chrome.storage.local.get(options.entryPath, function(localMetadata) {
    var metadata = localMetadata[options.entryPath];
    if (!metadata) {
      onError('NOT_FOUND');
    } else {
      onSuccess(sanitizeMetadata(metadata, options));
    }
  });
}

function onReadDirectoryRequested(options, onSuccess, onError) {
  console.log('onReadDirectoryRequested', options);

  chrome.storage.local.get(null, function(localMetadata) {
    var entries = Object.keys(localMetadata).map(function(entryPath) {
      return sanitizeMetadata(localMetadata[entryPath], options);
    });
    onSuccess(entries, false /* last call. */);
  });
}

// A map with currently opened files. As key it has requestId of
// openFileRequested and as a value the file path.
var openedFiles = {};

// A map with currently opened buffers. As key it has requestId of
// openFileRequested and as a value the buffer.
var openedBuffers = {};

function onOpenFileRequested(options, onSuccess, onError) {
  console.log('onOpenFileRequested', options);

  openedFiles[options.requestId] = options.filePath;
  onSuccess();
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

  if (openedBuffers[options.openRequestId]) {
    var bytes = new Uint8Array(openedBuffers[options.openRequestId]);
    for (var i = 0, binary = ''; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    var dataURI = 'data:image/png;base64,' + window.btoa(binary);
    var entryPath = openedFiles[options.openRequestId];
    chrome.storage.local.get(entryPath, function(localMetadata) {
      // Update file thumbnail.
      localMetadata[entryPath].thumbnail = dataURI;
      localMetadata[entryPath].modificationTime = new Date().toString();
      chrome.storage.local.set(localMetadata, function() {
        chrome.fileSystemProvider.get(FILE_SYSTEM_ID, function(fileSystemInfo) {
          fileSystemInfo.watchers.forEach(function(watcher) {
            // Notify watcher if relevant.
            if (entryPath.startsWith(watcher.entryPath)) {
              var notifyOptions = {
                fileSystemId: FILE_SYSTEM_ID,
                observedPath: watcher.entryPath,
                recursive: watcher.recursive,
                changeType: 'CHANGED'
              };
              chrome.fileSystemProvider.notify(notifyOptions);
            }
          });
          delete openedBuffers[options.openRequestId];
          delete openedFiles[options.openRequestId];
          onSuccess();
        });
      });
    });
  } else {
    delete openedFiles[options.openRequestId];
    onSuccess();
  }
}

function onMoveEntryRequested(options, onSuccess, onError) {
  console.log('onMoveEntryRequested', options);

  chrome.storage.local.get(options.sourcePath, function(data) {
    var localMetadata = {};
    localMetadata[options.targetPath] = data[options.sourcePath];
    localMetadata[options.targetPath].name = options.targetPath.substr(1);
    localMetadata[options.targetPath].modificationTime = new Date().toString();
    // TODO: Find out what to do with mimeType
    chrome.storage.local.set(localMetadata, function() {
      chrome.storage.local.remove(options.sourcePath, function() {
        onSuccess();
      })
    });
  })
}

function onTruncateRequested(options, onSuccess, onError) {
  console.log('onTruncateRequested', options);

  onSuccess();
}

function onWriteFileRequested(options, onSuccess, onError) {
  console.log('onWriteFileRequested', options);

  if (!openedFiles[options.openRequestId]) {
    onError('INVALID_OPERATION');
    return;
  }

  if (options.offset == 0) {
    openedBuffers[options.openRequestId] = options.data;
    onSuccess();
  } else if (!openedBuffers[options.openRequestId]) {
    onError('INVALID_OPERATION');
  } else {
    var blob = new Blob([openedBuffers[options.openRequestId], options.data]);
    var reader = new FileReader();
    reader.addEventListener("loadend", function() {
      openedBuffers[options.openRequestId] = reader.result;
      onSuccess();
    });
    reader.readAsArrayBuffer(blob);

  }
}

function onDeleteEntryRequested(options, onSuccess, onError) {
  console.log('onDeleteEntryRequested', options);

  chrome.storage.local.remove(options.entryPath, function() {
    onSuccess();
  })
}

function onAddWatcherRequested(options, onSuccess, onError) {
  console.log('onAddWatcherRequested', options);

  onSuccess();
}

function onRemoveWatcherRequested(options, onSuccess, onError) {
  console.log('onRemoveWatcherRequested', options);

  onSuccess();
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
  var options = { fileSystemId: FILE_SYSTEM_ID, displayName: 'Scan', writable: true };
  chrome.fileSystemProvider.mount(options, function() {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
    }
  });
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
chrome.fileSystemProvider.onMoveEntryRequested.addListener(onMoveEntryRequested);
chrome.fileSystemProvider.onWriteFileRequested.addListener(onWriteFileRequested);
chrome.fileSystemProvider.onTruncateRequested.addListener(onTruncateRequested);
chrome.fileSystemProvider.onAddWatcherRequested.addListener(onAddWatcherRequested);
chrome.fileSystemProvider.onRemoveWatcherRequested.addListener(onRemoveWatcherRequested);
chrome.fileSystemProvider.onMountRequested.addListener(onMountRequested);
chrome.fileSystemProvider.onUnmountRequested.addListener(onUnmountRequested);


chrome.app.runtime.onLaunched.addListener(showWindow);
chrome.runtime.onMessage.addListener(onMessage);
