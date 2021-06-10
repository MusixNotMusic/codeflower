// var fs = require('fs');
// const zlib = require('zlib');
// const gzip = zlib.createGzip();
// var archiver = require('archiver');
var path = require('path');
console.log(path.resolve(__dirname, '..'))
    // var output = fs.createWriteStream(__dirname + '/example.zip');
    // var archive = archiver('zip', {
    //     store: true // Sets the compression method to STORE. 
    // });

// output.on('close', function() {
//     console.log(archive.pointer() + ' total bytes');
//     console.log('archiver has been finalized and the output file descriptor has closed.');
// });

// // good practice to catch this error explicitly 
// archive.on('error', function(err) {
//     throw err;
// });

// var excel1 = "/Users/musix/Documents/cf_web/static/input/20170324.xlsx";
// archive.append(fs.createReadStream(excel1), { name: '1.xlsx' });

// var excel2 = "/Users/musix/Documents/cf_web/static/input/20170329.xlsx";
// archive.append(fs.createReadStream(excel2), { name: '2.xlsx' });

// var excel3 = "/Users/musix/Documents/cf_web/static/input/20170405.xlsx";
// archive.append(fs.createReadStream(excel3), { name: '3.xlsx' });

// var buffer3 = new Buffer('buff it!');
// archive.append(buffer3, { name: 'file1.txt' });
// archive.pipe(output);

// archive.finalize();