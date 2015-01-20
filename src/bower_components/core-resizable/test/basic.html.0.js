

  document.addEventListener('polymer-ready', function() {

    var testEl = document.querySelector('test-element');

    var registered = [];
    var notifyPending = [];
    var registerResizeHandler = function(el, expectNotification) {
      registered.push(el);
      if (expectNotification !== false) {
        notifyPending.push(el);
      }
      el.resizeHandler = function() {
        var idx = notifyPending.indexOf(this);
        if (idx < 0) {
          debugger;
        }
        assert(idx >= 0, 'resize notified to unexpected resizable ' + this.localName + '#' + this.id);
        notifyPending.splice(idx, 1);
      }.bind(el);
    };
    var unregisterResizeHandlers = function() {
      registered.forEach(function(r) {
        r.resizeHandler = null;
      });
      registered = [];
      notifyPending = [];
    };

    suite('core-resizer-parent', function() {

      test('notify resizables from window', function(done) {
        registerResizeHandler(testEl.$.parent);
        registerResizeHandler(testEl.$.child1a);
        registerResizeHandler(testEl.$.child1b);
        registerResizeHandler(testEl.$.shadow1c.$.resizable);
        registerResizeHandler(testEl.$.shadow1d.$.resizable);
        setTimeout(function() {
          window.dispatchEvent(new CustomEvent('resize', { bubbles: false }));
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('notify resizables from parent', function(done) {
        registerResizeHandler(testEl.$.parent);
        registerResizeHandler(testEl.$.child1a);
        registerResizeHandler(testEl.$.child1b);
        registerResizeHandler(testEl.$.shadow1c.$.resizable);
        registerResizeHandler(testEl.$.shadow1d.$.resizable);
        setTimeout(function() {
          testEl.$.parent.notifyResize();
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('detach resizables then notify parent', function(done) {
        registerResizeHandler(testEl.$.parent);
        registerResizeHandler(testEl.$.child1a, false);
        registerResizeHandler(testEl.$.child1b);
        registerResizeHandler(testEl.$.shadow1c.$.resizable, false);
        registerResizeHandler(testEl.$.shadow1d.$.resizable);
        testEl.$.child1a.remove();
        testEl.$.shadow1c.remove();
        setTimeout(function() {
          testEl.$.parent.notifyResize();
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('detach parent then notify window', function(done) {
        registerResizeHandler(testEl.$.parent, false);
        registerResizeHandler(testEl.$.child1a, false);
        registerResizeHandler(testEl.$.child1b, false);
        registerResizeHandler(testEl.$.shadow1c.$.resizable, false);
        registerResizeHandler(testEl.$.shadow1d.$.resizable, false);
        testEl.$.parent.remove();
        setTimeout(function() {
          window.dispatchEvent(new CustomEvent('resize', { bubbles: false }));
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

    });

    suite('core-resizer-parent-filtered', function() {

      test('notify resizables from window', function(done) {
        registerResizeHandler(testEl.$.parentFiltered);
        registerResizeHandler(testEl.$.child2a);
        registerResizeHandler(testEl.$.child2b, false);
        registerResizeHandler(testEl.$.shadow2c.$.resizable, false);
        registerResizeHandler(testEl.$.shadow2d.$.resizable, false);
        testEl.$.parentFiltered.active = testEl.$.child2a;
        setTimeout(function() {
          window.dispatchEvent(new CustomEvent('resize', { bubbles: false }));
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('notify resizables from parent', function(done) {
        registerResizeHandler(testEl.$.parentFiltered);
        registerResizeHandler(testEl.$.child2a);
        registerResizeHandler(testEl.$.child2b, false);
        registerResizeHandler(testEl.$.shadow2c.$.resizable, false);
        registerResizeHandler(testEl.$.shadow2d.$.resizable, false);
        testEl.$.parentFiltered.active = testEl.$.child2a;
        setTimeout(function() {
          testEl.$.parentFiltered.notifyResize();
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('detach resizables then notify parent', function(done) {
        registerResizeHandler(testEl.$.parentFiltered);
        registerResizeHandler(testEl.$.child2a, false);
        registerResizeHandler(testEl.$.child2b, false);
        registerResizeHandler(testEl.$.shadow2c.$.resizable, false);
        registerResizeHandler(testEl.$.shadow2d.$.resizable);
        testEl.$.child2a.remove();
        testEl.$.shadow2c.remove();
        testEl.$.parentFiltered.active = testEl.$.shadow2d.$.resizable;
        setTimeout(function() {
          testEl.$.parentFiltered.notifyResize();
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('detach parent then notify window', function(done) {
        registerResizeHandler(testEl.$.parentFiltered, false);
        registerResizeHandler(testEl.$.child2a, false);
        registerResizeHandler(testEl.$.child2b, false);
        registerResizeHandler(testEl.$.shadow2c.$.resizable, false);
        registerResizeHandler(testEl.$.shadow2d.$.resizable, false);
        testEl.$.parentFiltered.remove();
        testEl.$.parentFiltered.active = testEl.$.shadow2d.$.resizable;
        setTimeout(function() {
          window.dispatchEvent(new CustomEvent('resize', { bubbles: false }));
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

    });

    suite('core-resizer-peer', function() {

      test('notify resizables from window', function(done) {
        registerResizeHandler(testEl.$.peer);
        registerResizeHandler(testEl.$.child3a);
        registerResizeHandler(testEl.$.child3b);
        registerResizeHandler(testEl.$.shadow3c.$.resizable);
        registerResizeHandler(testEl.$.shadow3d.$.resizable);
        setTimeout(function() {
          window.dispatchEvent(new CustomEvent('resize', { bubbles: false }));
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('notify resizables from peer', function(done) {
        registerResizeHandler(testEl.$.peer);
        registerResizeHandler(testEl.$.child3a);
        registerResizeHandler(testEl.$.child3b);
        registerResizeHandler(testEl.$.shadow3c.$.resizable);
        registerResizeHandler(testEl.$.shadow3d.$.resizable);
        setTimeout(function() {
          testEl.$.peer.notifyResize();
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('detach resizables then notify', function(done) {
        registerResizeHandler(testEl.$.peer);
        registerResizeHandler(testEl.$.child3a, false);
        registerResizeHandler(testEl.$.child3b);
        registerResizeHandler(testEl.$.shadow3c.$.resizable, false);
        registerResizeHandler(testEl.$.shadow3d.$.resizable);
        testEl.$.child3a.remove();
        testEl.$.shadow3c.remove();
        setTimeout(function() {
          testEl.$.peer.notifyResize();
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('detach peer then notify', function(done) {
        registerResizeHandler(testEl.$.peer);
        registerResizeHandler(testEl.$.child3a, false);
        registerResizeHandler(testEl.$.child3b);
        registerResizeHandler(testEl.$.shadow3c.$.resizable, false);
        registerResizeHandler(testEl.$.shadow3d.$.resizable);
        testEl.$.peer.remove();
        setTimeout(function() {
          testEl.$.peer.notifyResize();
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

    });

    suite('core-resizer-peer-filtered', function(done) {

      test('notify resizables from window', function(done) {
        registerResizeHandler(testEl.$.peerFiltered);
        registerResizeHandler(testEl.$.child4a);
        registerResizeHandler(testEl.$.child4b, false);
        registerResizeHandler(testEl.$.shadow4c.$.resizable, false);
        registerResizeHandler(testEl.$.shadow4d.$.resizable, false);
        testEl.$.peerFiltered.active = testEl.$.child4a;
        setTimeout(function() {
          window.dispatchEvent(new CustomEvent('resize', { bubbles: false }));
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('notify resizables from peer', function(done) {
        registerResizeHandler(testEl.$.peerFiltered);
        registerResizeHandler(testEl.$.child4a);
        registerResizeHandler(testEl.$.child4b, false);
        registerResizeHandler(testEl.$.shadow4c.$.resizable, false);
        registerResizeHandler(testEl.$.shadow4d.$.resizable, false);
        testEl.$.peerFiltered.active = testEl.$.child4a;
        setTimeout(function() {
          testEl.$.peerFiltered.notifyResize();
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('detach resizables then notify parent', function(done) {
        registerResizeHandler(testEl.$.peerFiltered);
        registerResizeHandler(testEl.$.child4a, false);
        registerResizeHandler(testEl.$.child4b, false);
        registerResizeHandler(testEl.$.shadow4c.$.resizable, false);
        registerResizeHandler(testEl.$.shadow4d.$.resizable);
        testEl.$.child4a.remove();
        testEl.$.shadow4c.remove();
        testEl.$.peerFiltered.active = testEl.$.shadow4d.$.resizable;
        setTimeout(function() {
          testEl.$.peerFiltered.notifyResize();
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('detach peer then notify window', function(done) {
        registerResizeHandler(testEl.$.peerFiltered, false);
        registerResizeHandler(testEl.$.child4a, false);
        registerResizeHandler(testEl.$.child4b, false);
        registerResizeHandler(testEl.$.shadow4c.$.resizable, false);
        registerResizeHandler(testEl.$.shadow4d.$.resizable, false);
        testEl.$.peerFiltered.remove();
        testEl.$.peerFiltered.active = testEl.$.shadow4d.$.resizable;
        setTimeout(function() {
          window.dispatchEvent(new CustomEvent('resize', { bubbles: false }));
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

    });

    suite('core-resizer-nested', function() {

      test('notify resizables from window', function(done) {
        registerResizeHandler(testEl.$.parentTop);
        registerResizeHandler(testEl.$.parentNested);
        registerResizeHandler(testEl.$.peerNested);
        registerResizeHandler(testEl.$.child5a);
        registerResizeHandler(testEl.$.shadow5b.$.resizable);
        setTimeout(function() {
          window.dispatchEvent(new CustomEvent('resize', { bubbles: false }));
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('notify resizables from top parent', function(done) {
        registerResizeHandler(testEl.$.parentTop);
        registerResizeHandler(testEl.$.parentNested);
        registerResizeHandler(testEl.$.peerNested);
        registerResizeHandler(testEl.$.child5a);
        registerResizeHandler(testEl.$.shadow5b.$.resizable);
        setTimeout(function() {
          testEl.$.parentTop.notifyResize();
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('notify resizables from nested parent', function(done) {
        registerResizeHandler(testEl.$.parentTop, false);
        registerResizeHandler(testEl.$.parentNested);
        registerResizeHandler(testEl.$.peerNested);
        registerResizeHandler(testEl.$.child5a);
        registerResizeHandler(testEl.$.shadow5b.$.resizable);
        setTimeout(function() {
          testEl.$.parentNested.notifyResize();
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('notify resizables from nested peer', function(done) {
        registerResizeHandler(testEl.$.parentTop, false);
        registerResizeHandler(testEl.$.parentNested, false);
        registerResizeHandler(testEl.$.peerNested);
        registerResizeHandler(testEl.$.child5a);
        registerResizeHandler(testEl.$.shadow5b.$.resizable);
        setTimeout(function() {
          testEl.$.peerNested.notifyResize();
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      // Known limitation: peers of detached `resizerIsPeer` won't be notified
      // by parent resizers; ROI on that bookkeeping not considered high enough
      test('detach peer then notify', function(done) {
        registerResizeHandler(testEl.$.parentTop);
        registerResizeHandler(testEl.$.parentNested);
        registerResizeHandler(testEl.$.peerNested, false);
        registerResizeHandler(testEl.$.child5a, false);
        registerResizeHandler(testEl.$.shadow5b.$.resizable, false);
        testEl.$.peerNested.remove();
        setTimeout(function() {
          window.dispatchEvent(new CustomEvent('resize', { bubbles: false }));
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('detach resizables then notify', function(done) {
        registerResizeHandler(testEl.$.parentTop);
        registerResizeHandler(testEl.$.parentNested);
        registerResizeHandler(testEl.$.peerNested, false); // removed in above test
        registerResizeHandler(testEl.$.child5a, false);
        registerResizeHandler(testEl.$.shadow5b.$.resizable, false);
        testEl.$.child5a.remove();
        testEl.$.shadow5b.remove();
        setTimeout(function() {
          window.dispatchEvent(new CustomEvent('resize', { bubbles: false }));
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

      test('detach top parent then notify', function(done) {
        registerResizeHandler(testEl.$.parentTop, false);
        registerResizeHandler(testEl.$.parentNested, false);
        registerResizeHandler(testEl.$.peerNested, false);
        registerResizeHandler(testEl.$.child5a, false);
        registerResizeHandler(testEl.$.shadow5b.$.resizable, false);
        testEl.$.parentTop.remove();
        setTimeout(function() {
          window.dispatchEvent(new CustomEvent('resize', { bubbles: false }));
          assert(notifyPending.length === 0, 'all resizables were not notified');
          unregisterResizeHandlers();
          done();
        });
      });

    });

  });

