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

      // TODO: Remove when scanner comes.
      var scanResults = {
        dataUrls: ['data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2ODApLCBxdWFsaXR5ID0gOTAK/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgAKAAoAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A+Qfh94Du/HniLTdFsRiW5IBkb7qKOWY+wANfbvhT9lPwtpmjwx6pr73NtEnzWtnGIldvVm6mvnD9nDxBZ6Pq2pQEomoGKJYy3UqSd38l/Ovoe78ceHfCXOv6rFazSciIzZP5Z4r5Nymq3JY+vxlaNeMYr4YpffZXZieLP2X/AIdaxaXdtIl2skuTFcrOWeF+zAHjg9q+MPiV4T8Q/DzxHP4e1KRZVQH7PeLkJLGfuuvp7jscivua5+KnhOx0o6kt6bi0yf3qqWVcckZr57/aa8T6F8V/Bumaj4f/AHl5ZXe0yBlP7plIOcHOMqPzNepClJx5nsu587iOTS25876Zo0Gm25nvrhUCjdjdnf6AelFYlpbXviG9eC6YqYR0bhQO1FEuVP8AeT18jjPXPh2rT/EO2ubK6hMM9rLallcHbIoLqcflzXXH9mnxj4w1cnVLwxQyHcZ0uRtVfUjBLHv2+teQ/BDx5pPhy31fTdblNrDMn2m0ulUkpOoxtOB0YY/7596+ovDnj26toEjErTApkupyce3rXPWdWjU93+v6ufQ01RxEVJ721Xmkl+Nrl7TU+G/hHwdqPgDxDqbNAB50ccshaZiud8hK9M8H8K0tc+E3hrQfhRr8uir57PYNJbOVXIIG9M4Azzjk1534p03S9f8AEUWtHSn0e7Upm/1O4FusgUjGFwTggdwCRXfyeJL46K4nj09NKliEaTWdy0hcYxyCgAGOldeGjzUrOV73uceKSTvyq3Q+GjBe39zM8EbmV87lTsv/AOuiqXibU57e1082cksUpRlldDjcQaK7IRutDymYsqHzSqrgegr1n4c+PrvT9Mhjllcm2YR7gckL2H5cfhRRRWipw1Nac3CSse02Xx18L2VtHc3umPe3q9EmjEhB9QTxWL4m+Nw+IzW+jWdi+mWs0gSZkIDlTxgcYB5oorkp0o0oPlOmpVlUklI8F+INjB4V8Z6noiSJqUGnTGKGeQYYjAODt4yM4PuKKKK76a9yN+yOGW7P/9k='],
        mimeType: 'image/jpeg'
      }

      // TODO: Uncomment when scanner comes.
      /*
      if (chrome.runtime.lastError) {
        this.$.toast.text = chrome.runtime.lastError.message;
        this.$.toast.show();
        return;
      }
      */

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