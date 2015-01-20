
  document.addEventListener('polymer-ready', function() {
    var overlay = document.querySelector('core-overlay');

    asyncSeries([
      function(next) {
        // First, open the overlay.
        overlay.open();
        setTimeout(function() {
          // During the opening transition, close the overlay.
          overlay.close();
          // Wait for any exceptions to be thrown until the transition is done.
          setTimeout(function() { next(); }, 300);
        }, 100);
      },
    ], done);
  });

