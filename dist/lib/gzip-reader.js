"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zlib_1 = require("zlib");
const file_reader_1 = require("file-reader");
class GzipReader {
    // _fileOrfd :- File path or file descriptor.
    // _startPos :- Offset in no. of bytes to start reading gzip file from.
    constructor(_fileOrFd, _startPos = 0, _chunkSize = 65536) {
        this._fileOrFd = _fileOrFd;
        this._startPos = _startPos;
        this._chunkSize = _chunkSize;
        this._unused = [];
        this._memberStartsAt = _startPos;
        this._memberEndsAt = this._memberStartsAt - 1;
        // refer this answer :- https://stackoverflow.com/a/13112937/4850220
        // 10 bytes header and is equivalent to <Buffer 1f 8b 08 00 00 00 00 00 00 00>
        this._hBytes = Buffer.from([0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        this._reader = file_reader_1.FileReader(_fileOrFd, _startPos, _chunkSize);
    }
    // Making GzipReader class an iterable
    [Symbol.iterator]() {
        return this._gzipReader();
    }
    *_gzipReader() {
        for (const chunk of this._reader) {
            this._unused.push(chunk);
            const unusedBuf = Buffer.concat(this._unused);
            this._unused.splice(0);
            // offset is _lastMemberStartsAt but in current unusedBuf
            // However, this._lastMemberStartsAt is relative to all the previous data.
            let offset = 0;
            while (true) {
                const i = unusedBuf.indexOf(this._hBytes, offset + 1);
                if (i < 0)
                    break;
                const member = unusedBuf.slice(offset, i);
                const decompressed = zlib_1.gunzipSync(member);
                // Updating the start and end of member
                this._memberStartsAt = this._memberEndsAt + 1;
                this._memberEndsAt += member.length;
                yield decompressed;
                offset = i;
            }
            this._unused.push(unusedBuf.slice(offset));
        }
        // yielding last member
        if (this._unused.length) {
            const member = Buffer.concat(this._unused);
            // Updating the start and end of member
            this._memberStartsAt = this._memberEndsAt + 1;
            this._memberEndsAt += member.length;
            const decompressed = zlib_1.gunzipSync(member);
            yield decompressed;
        }
        this._cleanUp();
    }
    _cleanUp() {
        this._unused = null;
        this._memberStartsAt = null;
        this._memberEndsAt = null;
        this._hBytes = null;
        this._chunkSize = null;
        this._reader = null;
    }
    entries() {
        return this._gzipReader();
    }
    getMemberStart() {
        return this._memberStartsAt;
    }
    getMemberEnd() {
        return this._memberEndsAt;
    }
}
exports.GzipReader = GzipReader;
//# sourceMappingURL=gzip-reader.js.map