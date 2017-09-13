var cm = require('../componentsManager.js');

cm.define('foo', [], function() {
    return 'foo';
});

cm.define('foobar', ['foo', 'bar'], function(cm) {
    return cm.get('foo') + ' ' + cm.get('bar');
});

cm.create();