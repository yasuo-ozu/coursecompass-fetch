let gakubu = require('./lib/gakubu');

if (process.argv[2] == "searchGakubu" && process.argv[3]) {
	let list = gakubu.search(process.argv[3]);
	for (let item of list) {
		console.log(item);
	}
} else if (process.argv[2] == "listGakubu") {
	let list = gakubu.search(null);
	for (let item of list) {
		console.log(item);
	}
} else if (process.argv[2] == "fetchGakubu" && process.argv[3]) {
	if (!gakubu.getPageIDList(process.argv[3], function(data){
		for (let record of data) console.log(record);
	})) {
		process.stderr.write("error: gakubu not found\n");
	}
} else {
	console.log("node app searchGakubu <keyword>");
	console.log("node app listGakubu");
	console.log("node app fetchGakubu <gid>");
}
