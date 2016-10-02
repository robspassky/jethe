"use strict";
var http = require("http");
var serveStatic = require("serve-static");
var Route = (function () {
    function Route(url, cb) {
        this.url = url;
        this.cb = cb;
    }
    Route.prototype.matches = function (req) {
        return req.url === this.url;
    };
    return Route;
}());
var FileDir = (function () {
    function FileDir(pfx, dir, options) {
        if (options === void 0) { options = {}; }
        this.pfx = pfx;
        this.dir = dir;
        this.options = options;
        this.srv = serveStatic(dir, options);
    }
    FileDir.prototype.matches = function (req) {
        if (req.url.length < this.pfx.length) {
            return false;
        }
        if (req.url.length === this.pfx.length) {
            return req.url === this.pfx;
        }
        if (req.url.substring(0, this.pfx.length) === this.pfx) {
            return req.url.substring(this.pfx.length, this.pfx.length + 1) === "/";
        }
        return false;
    };
    FileDir.prototype.serve = function (req, res, cb) {
        req.url = this.extractFilePath(req.url);
        this.srv(req, res, function (err) { cb(false); });
    };
    FileDir.prototype.extractFilePath = function (url) {
        if (url.substring(0, this.pfx.length) === this.pfx) {
            return url.substring(this.pfx.length, url.length);
        }
    };
    return FileDir;
}());
var Server = (function () {
    function Server() {
        var _this = this;
        this.srv = http.createServer(function (req, rsp) { _this.handle(req, rsp); });
        this.routes = [];
        this.dirs = [];
    }
    Object.defineProperty(Server.prototype, "port", {
        get: function () {
            return this.srv.address().port;
        },
        enumerable: true,
        configurable: true
    });
    Server.prototype.get = function (url, cb) {
        this.routes.push(new Route(url, cb));
    };
    Server.prototype.addFileDir = function (pfx, dir) {
        this.dirs.push(new FileDir(pfx, dir));
    };
    Server.prototype.listen = function (port) {
        this.srv.listen(port);
    };
    Server.prototype.handle = function (req, rsp) {
        for (var i = 0; i < this.routes.length; i++) {
            if (this.routes[i].matches(req)) {
                this.routes[i].cb(req, rsp);
                return;
            }
        }
        function serveFile(dirs, idx) {
            if (idx >= dirs.length) {
                rsp.writeHead(404, "File not found");
                rsp.end();
                return;
            }
            if (dirs[idx].matches(req)) {
                dirs[idx].serve(req, rsp, function (served) {
                    if (served) {
                        return;
                    }
                    serveFile(dirs, idx + 1);
                });
            }
            else {
                serveFile(dirs, idx + 1);
            }
        }
        if (this.dirs.length > 0) {
            serveFile(this.dirs, 0);
        }
    };
    return Server;
}());
exports.Server = Server;
