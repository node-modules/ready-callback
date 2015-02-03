# Koa-ready

---


var koa = require('koa');
var ready = require('koa-ready');
var app = koa();
ready(app);
app.ready(function() {
	app.listen();
});

var done = app.async(id);
launchService(function(err) {
	if (err) return done(err);
    done();
});
