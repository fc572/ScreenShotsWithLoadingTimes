/**
 * Created by Francesco on 02/07/2015.
 */

var fs = require("fs");
phantom.casperPath = fs.workingDirectory + "/libs/casperjs";
console.log(fs.workingDirectory);
phantom.injectJs(phantom.casperPath + "/bin/bootstrap.js");

var page = require('webpage').create(),
    system = require('system'),
    fs = require("fs"),
    t, address;

var casper;
casper = require('casper').create({
    viewportSize: {
        width: 1027,
        height: 800
    },
    clientScripts: [fs.workingDirectory + '/libs/jquery-1.11.3.min.js']
});

/*
 Require and initialise PhantomCSS module
 */

var phantomcss = require(fs.workingDirectory + '/libs/phantomcss.js');

phantomcss.init({
    screenshotRoot: './screenshots/Test',
    failedComparisonsRoot: './failures/Test'
});

/*
 The test scenario
 */
page.onConsoleMessage = function(msg) {
    console.log(msg);
};

var url = 'http://InsertYourURLHERE'; // replace with your URL
var links;
casper.
    start(url).
    then(function(){
        links = casper.evaluate(function(){
            var domInsideCasperLinks = document.querySelectorAll('INSERT SELECTOR FOR ALL THE LINKS ON YOUR PAGE')
            return Array.prototype.map.call(domInsideCasperLinks, function(e) {
                return e.getAttribute('href');
            });
        });

        var repeatingFunction = function () {
            var link = links.shift();
            if (!link) { return };
            address = url.concat(link);
            console.log("address is ", address);

            t  = Date.now();
            casper.thenOpen(url.concat(link),function(){
                    t = Date.now() - t;
                    fs.write('Loading Times.txt', '\nLoading time for page ' + address + ' ' + t + ' msec', 'a');

                phantomcss.screenshot('#page-wrapper',link);
                repeatingFunction();
            });
        };
        repeatingFunction();
    });

/*
 End tests and compare screenshots
 */

casper.
    then(function now_check_the_screenshots() {
        phantomcss.compareAll();
    }).
    run(function end_it() {
        console.log('\nTHE END.');
        phantom.exit(phantomcss.getExitStatus());
    });

