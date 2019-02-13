const PromiseFtp = require('promise-ftp')
const fs = require('fs')

const xml = fs.readFileSync('./testfile.txt')
const xmlSize = xml.length

async function timeout (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function uploadFileNodePromise (args) {
  const ftp = new PromiseFtp()

  console.log('started')

  await ftp.connect({
    host: args.host,
    port: 21,
    user: args.username,
    password: args.password,
    secure: true,
    secureOptions: {
      rejectUnauthorized: false
    }
  })

  console.log('connected')

  await ftp.put(args.file.content, args.file.filename)

  console.log('uploaded file')

  const files = await ftp.list(args.file.filename)

  if (!files || files.length === 0) {
    console.log(files);
    throw new Error('file does not exist on server')
  }

  if (files[0].size !== xmlSize) {
    console.log(files);
    throw new Error('file on server has invalid size')
  }

  console.log('file size: ' + files[0].size)

  await ftp.delete(args.file.filename)

  console.log('deleted file')

  await ftp.end()
};

(async () => {
  console.time('ftp')

  for (let i = 0; i < 10; i++) {
    console.log('- Uploading file: ' + i)

    await uploadFileNodePromise({
      host: '',
      username: '',
      password: '',
      file: {
        content: xml,
        filename: `${i}.txt`
      }
    })

    console.log('- Done uploading file')
    console.log('')
  }

  console.log('Done uploading all files')

  console.timeEnd('ftp')
})()
