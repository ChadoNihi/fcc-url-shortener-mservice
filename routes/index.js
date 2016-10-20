const mongo = require("mongodb").MongoClient,
      shortid = require('shortid'),
      collName = 'urls',
      urlDB = process.env.MONGOLAB_URI,
      urlRE = new RegExp("^(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})"), //thanks http://stackoverflow.com/a/17773849/4579279
      shortUrlRE = new RegExp('.+'); //WARNING: accepts any non-empty string
      
exports.index = (req, res)=> {
    res.render('index', { fullUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
                            title: 'Instructions | URL Shortener App'});
};

exports.userUrl = (req, res)=> {
    if (urlRE.test(req.params.url)) {
        mongo.connect(urlDB, (err, db)=>{
            if (err) {
                res.status(500);
                res.send('Internal error');
            } else {
                db.collection(collName).findOne({long: req.params.url}, (err, doc)=>{
                    var shortened;
                    if (err) {
                        res.status(500);
                        res.send('Internal error');
                        db.close();
                        return;
                    } else if (doc) { //if already exist
                        shortened = doc.short;
                    } else {
                        shortened = shortid.generate();
                        db.collection(collName).insert([{long: req.params.url, short: shortened}]);
                    }
                    
                    res.json({
                        originalUrl: req.params.url,
                        result: shortened
                    });
                    
                    db.close();
                });
            }
        });
    } else {
        res.status(400);
        res.json({error: 'Accepts only valid HTTP/HTTPS URLs.'});
    }
};

exports.shortCode = (req, res)=> {
    if (shortUrlRE.test(req.params.short)) {
        mongo.connect(urlDB, (err, db)=>{
            if (err) {
                res.status(500);
                res.send('Internal error');
                db.close();
            } else {
                db.collection(collName).findOne({short: req.params.short}, (err, doc)=>{
                    if (err) {
                        res.status(500);
                        res.send('Internal error');
                    } else if (doc) {
                        res.redirect(doc.long);
                    } else {
                        res.status(404);
                        res.json({error: 'Could not find the requested URL.'});
                    }
                    db.close();
                });
            }
        });
    } else {
        res.status(400);
        res.json({error: 'Invalid short URL.'});
    }
};
