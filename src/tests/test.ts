import { GzipReader } from "../index"

const file = process.argv[2]
const reader = new GzipReader(file).entries()

const loop = setInterval(() => {
   const {done, value} = reader.next()
   if (!done) 
      process.stdout.write(value)
   else 
      clearInterval(loop)
}, 1)