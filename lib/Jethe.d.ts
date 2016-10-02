/// <reference types="node" />
import * as http from "http";
export declare class Jethe {
    private srv;
    private routes;
    private dirs;
    constructor();
    readonly port: number;
    get(url: string, cb: (req: http.IncomingMessage, rsp: http.ServerResponse) => void): void;
    addFileDir(pfx: string, dir: string): void;
    listen(port: number): void;
    private handle(req, rsp);
}
