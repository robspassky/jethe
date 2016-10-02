import * as http from "http";

class Route {
  constructor(public url: string, public cb: (req: http.IncomingMessage, rsp: http.ServerResponse) => void) {}
  public matches(req: http.IncomingMessage): boolean {
    return true;
  }
}

export class Server {
  private srv: http.Server;
  private routes: Route[];

  constructor() {
    this.srv = http.createServer((req, rsp) => { this.handle(req, rsp); });
    this.routes = [];
  }

  public get(url: string, cb: (req: http.IncomingMessage, rsp: http.ServerResponse) => void): void {
    this.routes.push(new Route(url, cb));
  }

  public listen(port: number) {
    this.srv.listen(port);
  }

  private handle(req: http.IncomingMessage, rsp: http.ServerResponse) {
    for (let i = 0; i < this.routes.length; i++) {
      if (this.routes[i].matches(req)) {
        this.routes[i].cb(req, rsp);
      }
    }
  }

}
