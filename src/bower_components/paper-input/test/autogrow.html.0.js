

    var a1 = document.getElementById('autogrow1');
    var t1 = document.getElementById('textarea1');

    function dispatchInputEvent(target) {
      var e = new Event('input', {
        bubbles: true
      });
      target.dispatchEvent(e);
    };

    function between(val, val1, val2) {
      return assert.ok(val > val1 && val < val2);
    }

    suite('basic', function() {

      teardown(function(done) {
        t1.value = '';
        dispatchInputEvent(t1);
        a1.rows = 1;
        a1.maxRows = 0;

        flush(function() {
          done();
        });
      });

      test('empty input has height', function() {
        assert.ok(a1.offsetHeight > 0);
      });

      test('accepts number input', function() {
        t1.value = 1;
        dispatchInputEvent(t1);
        // make sure we didn't crash
      });

      test('grows with more rows of input', function(done) {
        t1.value = 'foo\nbar';
        dispatchInputEvent(t1);

        var h1 = a1.offsetHeight;

        t1.value = 'foo\nbar\nbaz';
        dispatchInputEvent(t1);

        flush(function() {
          var h2 = a1.offsetHeight;
          assert.ok(h2 > h1);
          assert.deepEqual(a1.getBoundingClientRect(), t1.getBoundingClientRect());
          done();
        });
      });

      test('honors the rows attribute', function(done) {
        var h1 = a1.offsetHeight;
        a1.rows = 2;

        flush(function() {
          var h2 = a1.offsetHeight;
          between(h2, h1, 3 * h1);
          done();
        });
      });

      test('honors the maxRows attribute', function(done) {
        var h1 = a1.offsetHeight;
        a1.maxRows = 2;

        t1.value = 'foo\nbar\nbaz\nzot';
        dispatchInputEvent(t1);

        flush(function() {
          var h2 = a1.offsetHeight;
          assert.ok(h2 < 3 * h1);
          done();
        });
      });

      test('mirror text is visibility:hidden', function() {
        assert.equal(getComputedStyle(a1.$.mirror).visibility, 'hidden');
      });

    });

  