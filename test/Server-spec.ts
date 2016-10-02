import * as chai from "chai";
import * as sinon from "sinon";
const assert = chai.assert;
import { Utils } from "robspassky-ts-utils";

import { Server } from "../src/Server";

describe("server", function() {
  it("should exist", function() {
    let srv = new Server();
    assert(Server, "Server class should exist");
    assert(srv, "Server should be constructible");
  });

  it("get the port", function () {
    let srv = new Server();
    srv.listen(0);
    let port:number = srv.port;
    assert(srv.port === port, "Port should be the same");
  });

  it("should return pong", function (done) {
    let srv = new Server();
    srv.get("/ping", function (req: any, rsp: any) { rsp.end("pong"); });
    srv.listen(0);
    let port = srv.port;
    Utils.wget(`http://localhost:${port}/ping`, (err: any, body: string) => {
      if (err) {
        done(err);
        return;
      }
      assert(body === "pong", `body does not match: ${body}`);
      done();
    });
  });

  it("should handle two urls", function (done) {
    let srv = new Server();
    srv.get("/ping", function (req: any, rsp: any) { rsp.end("pong"); });
    srv.get("/ping2", function (req: any, rsp: any) { rsp.end("pong2"); });
    srv.listen(0);
    let port = srv.port;
    Utils.wget(`http://localhost:${port}/ping2`, (err: any, body: string) => {
      if (err) {
        done(err);
        return;
      }
      assert(body === "pong2", `body does not match: ${body}`);
      done();
    });
  });

  this.timeout = function() { return 10000; };

  it("should be able to serve a file", function (done) {
    let srv = new Server();
    srv.addFileDir("/files", "./test/docroot");
    srv.listen(0);
    console.error("sending request");
    Utils.wget(`http://localhost:${srv.port}/files/index.html`, (err: any, body: string) => {
      console.error("got response");
      if (err) { done(err); return; }
      assert(body.trim() === "<html>foo</html>", `body does not match: ${body}`);
      done();
    });
  });

  it("should be able to serve multiple docroots in different prefixes", function (done) {
    let srv = new Server();
    srv.addFileDir("/doc", "./test/docroot");
    srv.addFileDir("/www", "./test/docroot2");
    srv.listen(0);
    console.error("sending request");
    Utils.wget(`http://localhost:${srv.port}/www/index.html`, (err: any, body: string) => {
      if (err) { done(err); return; }
      assert(body.trim() === "<html>foo2</html>", `body does not match: ${body}`);
      Utils.wget(`http://localhost:${srv.port}/doc/index.html`, (err: any, body: string) => {
        if (err) { done(err); return; }
        assert(body.trim() === "<html>foo</html>", `body does not match: ${body}`);
        done();
      });
    });
  });


});

