

  var scope = document.querySelector('template[is=auto-binding]');

  scope.tapAction = function(e) {
    var target = e.target;
    if (!target.down) {
      target.setZ(target.z + 1);
      if (target.z === 5) {
        target.down = true;
      }
    } else {
      target.setZ(target.z - 1);
      if (target.z === 0) {
        target.down = false;
      }
    }
  };

