Polymer({
  i18n: function(name) {
    return chrome.i18n.getMessage(name);
  },
  close: function() {
    window.close();
  },
  confirm: function() {
    this.$.progressBar.hidden = false;
    this.$.confirmButton.disabled = true;

    var scanProperties = {};
    chrome.documentScan.scan(scanProperties, function(scanResults) {

      this.$.progressBar.hidden = true;
      this.$.confirmButton.disabled = false;

      if (chrome.runtime.lastError) {
        this.$.toast.text = chrome.runtime.lastError.message;
        this.$.toast.show();
        return;
      }
      this.$.toast.text = this.i18n('successMessage');
      this.$.toast.show();

      var dataUrls = scanResults.dataUrls;
      for (var i = 0; i < dataUrls.length; i++) {
        var title = new Date().getTime() + '.' + scanResults.mimeType.split('/')[1];
        if (this.$.documentName.value.trim()) {
          title = this.$.documentName.value.trim() + '_' + title;
        }
        var metadata = {};
        metadata['/' + title] = {
          isDirectory: false,
          name: title,
          size: atob(dataUrls[i].split(',')[1]).length,
          modificationTime: new Date().toString(),
          mimeType: scanResults.mimeType,
          thumbnail: dataUrls[i]
        };
        // Save metadata locally.
        chrome.storage.local.set(metadata, function() {
          if (!chrome.runtime.lastError) {
            chrome.runtime.sendMessage({action: 'mountFileSystem'});
          }
        });
      }
    }.bind(this));
  },
  ready: function() {
    document.addEventListener('keydown', function(event) {
      if (event.keyCode == 13)  // Enter
        this.$.confirmButton.click();
      if (event.keyCode == 27)  // Escape
        this.$.closeButton.click();
    }.bind(this));

    chrome.app.window.current().show();
  }
});
