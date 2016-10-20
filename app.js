const express = require('express'),
      stylus = require('stylus'),
      nib = require('nib'),
      routes = require('./routes'),
      app = express(),
      compile = (str, path)=> {
          return stylus(str)
            .set('filename', path)
            .use(nib());
};

app.set( 'port', ( process.env.PORT || 5000 ));
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(stylus.middleware(
    { src: __dirname + '/public'
    , compile: compile
    }
));
app.use(express.static(__dirname + '/public'));


app.get('/', routes.index);
app.get('/new/:url(*)', routes.userUrl);
app.get('/:short', routes.shortCode);


app.listen(app.get( 'port' ), function () {
  console.log('The timestamp app is listening on port '+app.get( 'port' )+'!');
});