;(function(exports, require){
	"use strict";

	var request = require('request');

	function findData(m0, mp, me, env){
		var s, t;
		env.p = env.text.indexOf(m0, env.p + 1) + m0.length - 1;
		env.p = env.text.indexOf(mp, env.p + 1);
		s = env.p + mp.length;
		env.p = env.text.indexOf(me, env.p + 1);
		t = env.p;
		return env.text.substring(s, t);
	}

	let gakubuList = [
		["政治経済学部", "政経", "111973"],
		["法学部", "法学", "121973"],
		["第一文学部", "一文", "132002"],
		["第二文学部", "二文", "142002"],
		["教育学部", "教育", "151949"],
		["商学部", "商学", "161973"],
		["理工学部", "理工", "171968"],
		["社会科学部", "社学", "181966"],
		["人間科学部", "人科", "192000"],
		["スポーツ科学部", "スポーツ", "202003"],
		["国際教養学部", "国際教養", "212004"],
		["文化構想学部", "文構", "232006"],
		["文学部", "文", "242006"],
		["人間科学部eスクール", "人通", "252003"],
		["基幹理工学部", "基幹", "262006"],
		["創造理工学部", "創造", "272006"],
		["先進理工学部", "先進", "282006"],
		["政治学研究科", "政研", "311951"],
		["経済学研究科", "経研", "321951"],
		["法学研究科", "法研", "331951"],
		["文学研究科", "文研", "342002"],
		["商学研究科", "商研", "351951"],
		["教育学研究科", "教研", "371990"],
		["人間科学研究科", "人研", "381991"],
		["社会科学研究科", "社学研", "391994"],
		["アジア太平洋研究科", "アジア研", "402003"],
		["国際情報通信研究科", "国情研", "422000"],
		["日本語教育研究科", "日研", "432001"],
		["情報生産システム研究科", "情シス研", "442003"],
		["公共経営研究科", "公共研", "452003"],
		["ファイナンス研究科", "ファイナンス研", "462004"],
		["法務研究科", "法科大学院", "法務研", "472004"],
		["会計研究科", "会計大学院", "会計研", "482005"],
		["スポーツ科学研究科", "スポーツ研", "502005"],
		["基幹理工学研究科", "基幹研", "512006"],
		["創造理工学研究科", "創造研", "522006"],
		["先進理工学研究科", "先進研", "532006"],
		["環境・エネルギー研究科", "環エネ研", "542006"],
		["教職研究科", "教職大学院", "教職研", "552007"],
		["国際コミュニケーション研究科", "国際コミ研", "562012"],
		["経営管理研究科", "ビジネススクール", "経管研", "572015"],
		["芸術学校", "芸術", "712001"],
		["日本語教育研究センター", "日本語", "922006"],
		["留学センター", "留学", "982007"],
		["グローバルエデュケーションセンター", "グローバル", "9S2013"]
	];

	var idList = new Array();

	function getPage(page, pidList, gid, callback){
		let opt = {
			uri: 'https://www.wsl.waseda.jp/syllabus/JAA101.php',
			form: {
				"p_number": "50",
				"p_page": "" + page,
				"p_gakubu": gid,
				"pClsOpnSts": "123",
				"ControllerParameters": "JAA103SubCon",
				"pLng": "jp",
			},
			json: true
		};
		process.stderr.write("Fetching page " + page + "...");
		request.post(opt, function(error, res, body){
			if (!error && res.statusCode == 200) {
				process.stderr.write("  200 OK.\n");
				var env = { text: body, p: 0 };
				if(env.text.indexOf("ch-message") != -1){
				process.stderr.write("All page is fetched.\n");
					callback(pidList);
					return;
				}
				env.p = env.text.indexOf("block_main_start", env.p + 1);
				env.p = env.text.indexOf("</tr>", env.p + 1);
				let endp = env.text.indexOf("</table>", env.p + 1);
				for(;;){
					env.p = env.text.indexOf("<tr>", env.p + 1) + 1;
					if(env.p == 0 || env.p > endp){
						break;
					}
					findData("<td", ">", "<", env);
					findData("<td", ">", "<", env);
					let id = findData("<td", ", '", "')", env);
					pidList.push(id);
				}
				getPage(page + 1, pidList, gid, callback);
			} else {
				process.stderr.write("  " + res.statusCode + " ERROR\n");
				callback(pidList);
			}
		});
	}

	exports.search = function(word) {
		let list = [];
		for (let record of gakubuList) {
			for (let col of record) {
				if (!word || word.indexOf(col) != -1 || col.indexOf(word) != -1) {
					list.push({
						"name": record[0],
						"id": record[record.length - 1]
					});
					break;
				}
			}
		}
		return list;
	};

	exports.getPageIDList = function(id, callback) {
		let isAvailableId = false;
		for (let record of gakubuList) {
			if (record[record.length - 1] == id) isAvailableId = true;
		}
		if (isAvailableId) getPage(1, [], id, callback);
		return isAvailableId;
	};
})(exports, require);

