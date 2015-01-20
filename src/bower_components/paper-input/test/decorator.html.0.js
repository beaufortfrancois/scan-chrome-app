

    var fake = new Fake();

    var d1 = document.getElementById('decorator1');
    var i1 = document.getElementById('input1');
    var d2 = document.getElementById('decorator2');
    var d3 = document.getElementById('decorator3');
    var i3 = document.getElementById('input3');
    var d4 = document.getElementById('decorator4');
    var i4 = document.getElementById('input4');
    var d5 = document.getElementById('decorator5');

    function reset(d, i) {
      d.labelVisible = null;
      i.value = null;
      d.updateLabelVisibility(i.value);
    }

    suite('basic', function() {

      teardown(function() {
        reset(d1, i1);
        reset(d3, i3);
      });

      test('label is invisible if value is not null', function() {
        assert.ok(d1._labelVisible);
        i1.value = 'foobar';
        d1.updateLabelVisibility(i1.value);
        assert.ok(!d1._labelVisible);
      });

      test('label is invisible if floating label and focused', function(done) {
        assert.ok(d3._labelVisible);
        d3.focusAction();
        flush(function() {
          assert.ok(!d3._labelVisible);
          done();
        });
      });

      test('label is invisible if value = 0', function() {
        assert.ok(d1._labelVisible);
        i1.value = 0;
        d1.updateLabelVisibility(i1.value);
        assert.ok(!d1._labelVisible);
      });

      test('labelVisible overrides label visibility', function() {
        d1.labelVisible = false;
        assert.ok(!i1.value);
        assert.ok(!d1._labelVisible);
      });

      test('labelVisible works in an attribute', function() {
        assert.ok(!d5._labelVisible);
      });

      test('can create inputs lazily', function() {
        var input = document.createElement('input');
        input.value = 'foobar';
        d2.appendChild(input);
        assert.ok(!d2._labelVisible);
      });

      test('tapping on floating label focuses input', function(done) {
        i3.value = 'foobar';
        flush(function() {
          assert.ok(!d3._labelVisible);
          fake.downOnNode(d1.shadowRoot.querySelector('.floated-label'));
          flush(function() {
            assert.strictEqual(window.ShadowDOMPolyfill ? wrap(document.activeElement) : document.activeElement, i1);
            done();
          })
        });
      });

      test('floating label and the error message are the same color', function() {
        var s1 = getComputedStyle(d4.$.floatedLabelText);
        var s2 = getComputedStyle(d4.shadowRoot.querySelector('.error-text'));
        assert.strictEqual(s1.color, s2.color);
      });

    });

  