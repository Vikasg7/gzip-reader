"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const file = process.argv[2];
const reader = new index_1.GzipReader(file).entries();
const loop = setInterval(() => {
    const { done, value } = reader.next();
    if (!done)
        process.stdout.write(value);
    else
        clearInterval(loop);
}, 1);
//# sourceMappingURL=test.js.map