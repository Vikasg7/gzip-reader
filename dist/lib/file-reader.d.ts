/// <reference path="../../src/index.d.ts" />
/// <reference types="node" />
export declare function FileReader(fileOrStdinOrFd: string | (typeof process.stdin) | number, startAt?: number, chunkSizeInBytes?: number): IterableIterator<Buffer>;
