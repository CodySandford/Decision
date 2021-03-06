/*globals before,describe,it*/

// HTTP Request example
var http = require('http'),
    urlencode = require('urlencode'),
    Server = require('../src/server/Server'),
    assert = require('assert'),
    TEST_PORT = 9342;

describe('Server API tests', function() {
    'use strict';
    before(function(done) {
        var server = new Server({requestor: 'Test',
                                 port: TEST_PORT});
        server.start(done);
    });

    // Helpers
    var submitRequest = function(params, cb) {

        var cat = params.cat.reduce(function(prev,curr) {
                return prev+'&cat[]='+curr;
            }, ''),
            get_data;

            if (!params.zip) {
                get_data = 'lat='+params.lat+'&lng='+params.lng;
            } else {
                get_data = 'zip='+params.zip;
            }
            get_data += '&dist='+ params.dist+cat+'&num='+params.num;
            var options = {
                host: 'localhost',
                port: TEST_PORT,
                path: '/places?'+get_data,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

        var req = http.request(options, function(res) {
            // response is here
            res.on("data", function(chunk){
                cb(JSON.parse(chunk));
            });
        });
        req.end();
    };

    it('Should return restaurants given a places request', function(done) {
        submitRequest({lat:36.15768,
                       lng:-86.764677,
                       dist:1000,
                       cat:['restaurant'],
                       num:10}, function(chunk) {

            assert.notEqual(chunk.length, 0);
            done();
        });
    });

    it('Should accepts multiple types', function(done) {
        submitRequest({lat:36.15768,
                       lng:-86.764677,
                       dist:1000,
                       cat:['restaurant', 'cafe'],
                       num:10}, function(chunk) {

            assert.notEqual(chunk.length, 0);
            done();
        });
    });

    it('Should accept arrays of lists of catagories', function(done){
        submitRequest({lat:36.15768,
                       lng:-86.764677,
                       dist:100,
                       cat:["food;cafe;restaurant","camping","movie_theater;movie_rental"],
                       num:10}, function(chunk){
             done();
         });
    });

    it('Should accept zip code instead of lat,lng', function(done){
        submitRequest({zip:'37203',
                       dist:1000,
                       cat:['restaurant'],
                       num:10},function(chunk){
          
            assert.notEqual(chunk.length, 0);
            done();
        });
    });

    it('Should only return places that currently open', function(done){
        submitRequest({zip:'37203',
                       dist:1000,
                       cat:['restaurant'],
                       num:10},function(chunk){
          
            // Check that all places are either open or don't have that item set
            var all_open = true;
            for (var i = chunk.length - 1; i >= 0; i--) {
                var hours = chunk[i].opening_hours;
                if (hours) {
                    if (hours.hasOwnProperty('open_now') && !hours.open_now){
                        all_open = false;
                        break;
                    }
                }
            }
            assert(all_open, "Found a place that is closed");
            done();
        });
    });

    describe('Google Server API tests', function() {
        
        before(function(done) {
            var server = new Server({requestor: 'Google',
                                    port: TEST_PORT});
            server.start(done);
        });

    });

    it('Should accept arrays of lists of catagories', function(done){
        submitRequest({lat:36.15768,
                      lng:-86.764677,
                      dist:100,
                      cat:["food;cafe;restaurant","camping","movie_theater;movie_rental"],
                      num:10}, function(chunk){
                          done();
                      });
    });

});

