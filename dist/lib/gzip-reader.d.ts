/// <reference types="node" />
export declare class GzipReader {
    private _fileOrFd;
    private _startPos;
    private _chunkSize;
    private _unused;
    private _memberStartsAt;
    private _memberEndsAt;
    private _hBytes;
    private _reader;
    constructor(_fileOrFd: string | number, _startPos?: number, _chunkSize?: number);
    [Symbol.iterator](): IterableIterator<Buffer>;
    private _gzipReader();
    private _cleanUp();
    entries(): IterableIterator<Buffer>;
    getMemberStart(): number;
    getMemberEnd(): number;
}
