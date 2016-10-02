/// <reference types="node" />
import * as http from "http";
export declare class Server {
    private srv;
    private routes;
    constructor();
    get(url: string, cb: (req: http.IncomingMessage, rsp: http.ServerResponse) => void): void;
    listen(port: number): void;
    private handle(req, rsp);
}
