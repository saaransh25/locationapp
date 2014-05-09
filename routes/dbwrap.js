/* Wrapper for Database Operations */

var pg = require('pg');

exports.runsql= function (querystring2, parameters, callback) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        client.query(querystring2, parameters, function(err, result) {
            done();
            callback(err,result);
        });
    });
}


