# gzip-reader

- ### Intro  
   **gzip-reader** is a ES6 Class which returns an iterable to iterater over content in a `gzip file` member by member using `.next()` method or `for..of` loop.

- ### Install  
   `npm install git+https://github.com/Vikasg7/gzip-reader.git`  

- ### Syntax  
   ````javascript  
   const reader: GzipReader = new GzipReader(_fileOrFd: string | number, _startPos?: number, _chunkSize?: number)
   const iterable = reader.entries()
   ````

- ### Usage (in TypeScript)  
   ````javascript  
      import { GzipReader } from "gzip-reader"

      const file = process.argv[2]
      const reader = new GzipReader(file).entries()

      const loop = setInterval(() => {
      const {done, value} = reader.next()
      if (!done) 
            process.stdout.write(value)
      else 
            clearInterval(loop)
      }, 1)
   ````

- ### Example
   Check the tests folder in src folder for an example.