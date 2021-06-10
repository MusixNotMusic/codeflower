import { trim } from "lodash"
const fs = require("fs")
const env = fs.existsSync('./env') ? fs.readFileSync('./env', 'utf8') : 'dev'
export let config = require(`./config/${trim(env)}.js`)