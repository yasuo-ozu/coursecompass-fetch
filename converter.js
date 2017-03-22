let fs = require('fs');
let i;
for (i = 2; i < process.argv.length; i++) {
	let fname = process.argv[i];
	fs.readFile(fname, 'utf8', function(err, text) {
		if (err) {
			console.log("error: " + fname);
		} else {
			let all = JSON.parse(text);
			
			for(let record of all) {
				process.stdout.write(JSON.stringify(record).replace(/\n/g, "") + "\n");

			}

		}
	});


}
