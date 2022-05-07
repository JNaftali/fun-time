// @ts-check
import path, {dirname} from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {'production' | 'development'} */
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'

/** @type {import('webpack').Configuration} */
export default {
    mode,
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist')
    }
}