
    Polymer({
      active: null,
      resizerShouldNotify: function(el) {
        return (el == this.active);
      }
    });
  