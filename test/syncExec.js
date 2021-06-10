const child_process =  require('child_process')
const execSync = child_process.execSync
let result = execSync(`casperjs ${process.cwd()}/queue/auth/auth_code.js`)
console.log('result', result.toString())