var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/', function (request, response) {
    //res.send('Hello World!!');
    var requestParams = parseGET(request.url);
    var url = requestParams["url"];
    console.log("Connecting to " + url);
    if (url == undefined) {
        response.write("Invalid request! Please try again!!");
        response.statusCode = 400;
        response.headers = {
            'Cache': 'no-cache',
            'Content-Type': 'text/plain;charset=utf-8'
        };
        response.send();
    }

    var phantom = require('phantom');
    phantom.create().then(function (ph) {
        ph.createPage().then(function (page) {
            page.open(url).then(function (status) {
                console.log(status);
                if (status !== 'success') {
                    console.log('Failed to open URL ' + url);
                } else {
                    page.property('content').then(function (content) {
                        console.log(content);
                        response.statusCode = 200;
                        response.headers = {
                            'Cache': 'no-cache',
                            'Content-Type': 'text/plain;charset=utf-8'
                        };
                        response.send(content);
                        page.close();
                        ph.exit();
                    });
                }
            });
        });
    });
})

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

function parseGET(url) {
    var query = url.substr(url.indexOf("?") + 1);
    var result = {};
    query.split("&").forEach(function (part) {
        var e = part.indexOf("=")
        var key = part.substr(0, e);
        var value = part.substr(e + 1);
        result[key] = decodeURIComponent(value);
    });
    return result;
}
