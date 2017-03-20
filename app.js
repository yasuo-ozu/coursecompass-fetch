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
	let gidList = [];
	let pidList = [];
	if (process.argv[3] == "*") {
		let list = gakubu.search(null);
		for (let item of list) {
			gidList.push(item.id);
		}
	} else {
		gidList = [process.argv[3]];
	}
	function loop() {
		let gid = gidList.shift();
		process.stderr.write("fetching gakubu " + gid + "...\n");
		if (!gakubu.getPageIDList(gid, function(data){
			for (let record of data) pidList.push(record);
			if (gidList.length) {
				loop();
			} else {
				for (let record of pidList) {
					process.stdout.write(record + "\n");
				}
			}
		})) {
			process.stderr.write("error: " + gid + " not found\n");
		}
	}
	loop();
} else {
	console.log("node app searchGakubu <keyword>");
	console.log("node app listGakubu");
	console.log("node app fetchGakubu <gid>");
	console.log("node app fetchGakubu '*'");
}
