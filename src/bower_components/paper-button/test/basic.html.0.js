

    var b1 = document.getElementById('button1');

    test('can set raised imperatively', function(done) {
      assert.ok(!b1.shadowRoot.querySelector('paper-shadow'));
      b1.raised = true;
      flush(function() {
        var shadow = b1.shadowRoot.querySelector('paper-shadow');
        assert.ok(shadow);
        assert.notEqual(getComputedStyle(shadow.$['shadow-top'])['box-shadow'], 'none');
        done();
      });
    });

  