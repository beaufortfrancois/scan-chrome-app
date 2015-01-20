
    Polymer(Polymer.mixin({
      eventDelegates: {
        'core-resize': 'resizeHandler'
      },
      attached: function() {
        this.resizableAttachedHandler();
      },
      detached: function() {
        this.resizableDetachedHandler();
      }
    }, Polymer.CoreResizable));
  