

    var i1 = document.getElementById('input1');
    var i2 = document.getElementById('input2');

    test('aria-label set to placeholder', function(done) {
      assert.strictEqual('label', i1.getAttribute('aria-label'));
      // test failing on polyfill due to https://github.com/Polymer/webcomponentsjs-dev/issues/13
      // i1.placeholder = 'new label';
      i1.setAttribute('placeholder', 'new label');
      flush(function() {
        assert.strictEqual(i1.getAttribute('aria-label'), 'new label');
        done();
      });
    });

    test('aria-disabled is set', function(done) {
      assert.ok(i2.hasAttribute('aria-disabled'));
      i2.removeAttribute('disabled');
      flush(function() {
        assert.ok(!i2.hasAttribute('aria-disabled'));
        done();
      });
    });

  