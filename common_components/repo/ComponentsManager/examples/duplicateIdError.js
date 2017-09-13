var cm = require('../componentsManager.js');

cm.define('foo', [], function() {
    return 'foo';
});

cm.define('foo', function(cm) {
    return 'bar';
});

cm.create();