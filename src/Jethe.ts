import * as http from "http";
import * as serveStatic from "serve-static";

class Route {
  constructor(public url: string, public cb: (req: http.IncomingMessage, rsp: http.ServerResponse) => void) {}
  public matches(req: http.IncomingMessage): boolean {
    return req.url === this.url;
  }
}

class FileDir {
  private srv: any;

  constructor(public pfx: string, public dir: string, public options: any = {}) {
    this.srv = serveStatic(dir, options);
  }

  public matches(req: http.IncomingMessage): boolean {
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
  }

  public serve(req: http.IncomingMessage, res: http.ServerResponse, cb: (err: boolean) => void ) {
    req.url = this.extractFilePath(req.url);
    this.srv(req, res, (err: any) => { cb(false); });
  }

  private extractFilePath(url: string): string {
    if (url.substring(0, this.pfx.length) === this.pfx) {
      return url.substring(this.pfx.length, url.length);
    }
  }

}

export class Jethe {
  private srv: http.Server;
  private routes: Route[];
  private dirs: FileDir[];

  constructor() {
    this.srv = http.createServer((req, rsp) => { this.handle(req, rsp); });
    this.routes = [];
    this.dirs = [];
  }

  get port(): number {
    return this.srv.address().port;
  }

  public get(url: string, cb: (req: http.IncomingMessage, rsp: http.ServerResponse) => void): void {
    this.routes.push(new Route(url, cb));
  }

  public addFileDir(pfx: string, dir: string) {
    this.dirs.push(new FileDir(pfx, dir));
  }

  public listen(port: number) {
    this.srv.listen(port);
  }

  private handle(req: http.IncomingMessage, rsp: http.ServerResponse) {
    for (let i = 0; i < this.routes.length; i++) {
      if (this.routes[i].matches(req)) {
        this.routes[i].cb(req, rsp);
        return;
      }
    }

    function serveFile(dirs: FileDir[], idx: number) {
      if (idx >= dirs.length) {
        rsp.writeHead(404, "File not found");
        rsp.end();
        return;
      }
      if (dirs[idx].matches(req)) {
        dirs[idx].serve(req, rsp, (served) => {
          if (served) { return; }
          serveFile(dirs, idx + 1);
        });
      } else {
        serveFile(dirs, idx + 1);
      }
    }

    if (this.dirs.length > 0) {
      serveFile(this.dirs, 0);
    }
  }

}
