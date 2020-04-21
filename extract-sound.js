var argv = require('minimist')(process.argv.slice(2))
const Stopwatch = require('statman-stopwatch')
console.log(argv)
const fs = require('fs')
const download = require('download')
const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const {nanoid} = require('nanoid')
const sw = new Stopwatch()
const swDL = new Stopwatch()
let downloadTime = 0
let extractTime = 0
const noop = () => { }

const {
  log = noop,
  transform = noop,
  channel = 0,
  output,
  format
} = {
  output: argv.output
}

let input = argv.input
const f = format || (output ? path.parse(output).ext.slice(1) : 'mp3')

;(async () => {
  let fileName = ''
  if (argv.url) {
    fileName = `${nanoid(5)}.mp4`
    swDL.start()
    console.log('download')
    fs.writeFileSync(`/tmp/${fileName}`, await download(argv.url))
    downloadTime = swDL.read()
    console.log('finish downloaded:', downloadTime)
    input = `/tmp/${fileName}`
  }

const cmd = ffmpeg(input)
      .audioChannels(channel)
      .audioFrequency(44100)
      .format(f)
      .on('start', (cmd) => {
        console.log('start')
        sw.start()
      })
      .on('end', () => {
        console.log('finish')
        extractTime = sw.read()
        console.log(`${extractTime / 1000} s`)
        console.log(`Total time: ${(extractTime + downloadTime)/1000}s`)
      })
      .on('error', (err) => {
        console.error(err)
      })

    transform(cmd)

cmd.output(output).run()
})()
