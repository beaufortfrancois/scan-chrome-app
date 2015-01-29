Polymer({
  i18n: function(name) {
    return chrome.i18n.getMessage(name);
  },
  cancel: function() {
    window.close();
  },
  confirm: function() {
    this.$.progressBar.hidden = false;

    var scanProperties = {};
    chrome.documentScan.scan(scanProperties, function(scanResults) {

      this.$.progressBar.hidden = true;

      if (chrome.runtime.lastError) {
        this.$.toast.text = chrome.runtime.lastError.message;
        this.$.toast.show();
        return;
      }

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
        chrome.storage.local.set(metadata);
      }

      this.$.toast.text = this.i18n('successMessage');
      this.$.toast.show();

    }.bind(this));

  },
  ready: function() {
    this.injectBoundHTML(chrome.i18n.getMessage('disclaimer'), this.$.disclaimer);

    document.addEventListener('keydown', function(event) {
      if (event.keyCode == 13)  // Enter
        this.$.confirmButton.click();
      if (event.keyCode == 27)  // Escape
        this.$.cancelButton.click();
    }.bind(this));

    chrome.app.window.current().show();
  }
});
