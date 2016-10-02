"use strict";
var http = require("http");
var Route = (function () {
    function Route(url, cb) {
        this.url = url;
        this.cb = cb;
    }
    Route.prototype.matches = function (req) {
        return true;
    };
    return Route;
}());
var Server = (function () {
    function Server() {
        var _this = this;
        this.srv = http.createServer(function (req, rsp) { _this.handle(req, rsp); });
        this.routes = [];
    }
    Server.prototype.get = function (url, cb) {
        this.routes.push(new Route(url, cb));
    };
    Server.prototype.listen = function (port) {
        this.srv.listen(port);
    };
    Server.prototype.handle = function (req, rsp) {
        for (var i = 0; i < this.routes.length; i++) {
            if (this.routes[i].matches(req)) {
                this.routes[i].cb(req, rsp);
            }
        }
    };
    return Server;
}());
exports.Server = Server;
