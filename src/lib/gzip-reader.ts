import { readSync, openSync, closeSync } from "graceful-fs"
import { gunzipSync } from "zlib"
import { FileReader } from "file-reader"

export class GzipReader {
   private _unused: Array<Buffer>
   // zero based index of 10 header bytes
   private _memberStartsAt: number
   private _memberEndsAt: number
   // 10 header bytes to make the start of the next gzip member
   private _hBytes: Buffer
   private _reader: IterableIterator<Buffer>

   // _fileOrfd :- File path or file descriptor.
   // _startPos :- Offset in no. of bytes to start reading gzip file from.
   constructor(private _fileOrFd: string|number, private _startPos: number = 0, private _chunkSize = 65536) {
      this._unused = []
      this._memberStartsAt = _startPos
      this._memberEndsAt = this._memberStartsAt - 1
      // refer this answer :- https://stackoverflow.com/a/13112937/4850220
      // 10 bytes header and is equivalent to <Buffer 1f 8b 08 00 00 00 00 00 00 00>
      this._hBytes = Buffer.from([0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
      this._reader = FileReader(_fileOrFd, _startPos, _chunkSize)
   }

   // Making GzipReader class an iterable
   [Symbol.iterator](): IterableIterator<Buffer> { 
      return this._gzipReader()
   }

   private *_gzipReader(): IterableIterator<Buffer> {
      for (const chunk of this._reader) {
         this._unused.push(chunk)
         const unusedBuf = Buffer.concat(this._unused)
         this._unused.splice(0)
         // offset is _lastMemberStartsAt but in current unusedBuf
         // However, this._lastMemberStartsAt is relative to all the previous data.
         let offset = 0
         while (true) {
            const i = unusedBuf.indexOf(this._hBytes, offset + 1)
            if (i < 0) break

            const member = unusedBuf.slice(offset, i)
            const decompressed = gunzipSync(member)

            // Updating the start and end of member
            this._memberStartsAt = this._memberEndsAt + 1
            this._memberEndsAt += member.length

            yield decompressed

            offset = i
         }
         this._unused.push(unusedBuf.slice(offset))
      }

      // yielding last member
      if (this._unused.length) {
         const member = Buffer.concat(this._unused)

         // Updating the start and end of member
         this._memberStartsAt = this._memberEndsAt + 1
         this._memberEndsAt += member.length

         const decompressed = gunzipSync(member)
         yield decompressed
      }
      this._cleanUp()
   }

   private _cleanUp() {
      this._unused = null
      this._memberStartsAt = null
      this._memberEndsAt = null
      this._hBytes = null
      this._chunkSize = null
      this._reader = null
   }

   public entries(): IterableIterator<Buffer> {
      return this._gzipReader()
   }

   public getMemberStart() {
      return this._memberStartsAt
   }
   
   public getMemberEnd() {
      return this._memberEndsAt
   }
}