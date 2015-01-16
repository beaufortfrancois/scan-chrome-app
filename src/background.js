window.onload = function() {

  resetLocalStorage(function() {
    // Mount the file system.
    var options = { fileSystemId: 'scan', displayName: 'Scan' };
    chrome.fileSystemProvider.mount(options, function() {});
  });
}

function resetLocalStorage() {
  // Clear first.
  chrome.storage.local.clear(function() {
    // Save root metadata.
    chrome.storage.local.set({'/': {
      isDirectory: true,
      name: 'scan',
      size: 0,
      modificationTime: new Date().toString()
    }});
  });
}

function sanitizeMetadata(metadata) {
  metadata.modificationTime = new Date(metadata.modificationTime);
  return metadata;
}

function onGetMetadataRequested(options, onSuccess, onError) {
  console.log('onGetMetadataRequested', options.entryPath);

  chrome.storage.local.get(options.entryPath, function(localMetadata) {
    var metadata = localMetadata[options.entryPath];
    if (!metadata) {
      onError('NOT_FOUND');
    } else {
      // If no thumbnail is requested, make sure metadata don't include one.
      if (!options.thumbnail) {
        delete(metadata.thumbnail);
      }
      console.log(metadata)
      onSuccess(sanitizeMetadata(metadata));
    }
  });
}

function onReadDirectoryRequested(options, onSuccess, onError) {
  console.log('onReadDirectoryRequested', options);

  var scanProperties = {};
  chrome.documentScan.scan(scanProperties, function(scan_results) {
    if (chrome.runtime.lastError) {
      console.log('Scan failed: ' + chrome.runtime.lastError.message);
      onError('IN_USE');
      return;
    }
    // Clear local storage first
    resetLocalStorage(function() {

      for (var i = 1; i <= scan_results.dataUrls.length; i++) {
        var title = 'Page ' + i;
        var metadata = {};
        metadata['/' + title] = {
          isDirectory: false,
          name: title,
          size: 1024, //TODO
          modificationTime: new Date().toString(),
          mimeType: scan_results.mimeType,
          thumbnail: scan_results.dataUrls[i]
        };
        // Save metadata locally.
        chrome.storage.local.set(metadata);
      }

      // TODO: Remove ugly code below.
      chrome.storage.local.get(null, function(localMetadata) {
        var scans = Object.keys(localMetadata).filter(function(entryPath) { return (entryPath !== '/'); }).map(function(entryPath) { return sanitizeMetadata(localMetadata[entryPath]); });
        onSuccess(scans, false /* last call. */);
      });

    });
  });
}

chrome.fileSystemProvider.onGetMetadataRequested.addListener(onGetMetadataRequested);
chrome.fileSystemProvider.onReadDirectoryRequested.addListener(onReadDirectoryRequested);