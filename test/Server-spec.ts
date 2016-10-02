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

  it("should return pong", function (done) {
    let srv = new Server();
    srv.get("/ping", function (req: any, rsp: any) { rsp.end("ponger"); });
    srv.listen(33030);
    Utils.wget("http://localhost:33030/ping", (err: any, body: string) => {
      if (err) {
        done(err);
        return;
      }
      assert(body === "pong", `body does not match: ${body}`);
      done();
    });
  });
});

