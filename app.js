let gakubu = require('./lib/gakubu');
let classes = require('./lib/class');

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
	(function loop() {
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
	})();
} else if (process.argv[2] == "fetchClass" && process.argv[3]) {
	let pidList = [];
	let res = [];
	let loop = function loop() {
		let pid = pidList.shift();
		process.stderr.write("fetching page " + pid + "...\n");
		classes.fetch(pid, function(data){
			if (data) {
				res.push(data);
				if (pidList.length) {
					loop();
				} else {
					process.stdout.write(JSON.stringify(res));
				}
			} else {
				process.stderr.write("error: some error occurs when fetching or parsing " + pid + "\n");
			}
		});
	};
	if (process.argv[3] == "-") {
		process.stdin.resume();
		let str = "", ind;
		process.stdin.on('data', function(chunk) {
			str += chunk;
			while ((ind = str.indexOf("\n")) > -1) {
				let line = str.slice(0, ind);
				str = str.slice(ind + 1);
				pidList.push(line);
			}
		});
		process.stdin.on('end', function() {
			if (str) {
				pidList.push(str);
			}
			loop();
		});
	} else {
		pidList = [process.argv[3]];
		loop();
	}
} else {
	console.log("node app searchGakubu <keyword>");
	console.log("node app listGakubu");
	console.log("node app fetchGakubu <gid>");
	console.log("node app fetchGakubu '*'");
	console.log("node app fetchClass <pid>");
	console.log("node app fetchClass -");
}
