import Worker from './main/work'
const worker = new Worker();
worker.emit('auth');