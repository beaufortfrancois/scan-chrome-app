
    Polymer(Polymer.mixin({
      eventDelegates: {
        'core-resize': 'resizeHandler'
      },
      attached: function() {
        this.resizerAttachedHandler();
      },
      detached: function() {
        this.resizerDetachedHandler();
      }
    }, Polymer.CoreResizer));
  