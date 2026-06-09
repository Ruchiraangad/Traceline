import { PDFParse } from 'pdf-parse'
import { readFileSync } from 'fs'

const buffer = readFileSync(process.argv[2])
const parser = new PDFParse({ data: buffer })
const result = await parser.getText()
console.log(result.text)
