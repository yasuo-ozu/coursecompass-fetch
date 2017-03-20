;(function(exports, require) {
	"use strict";

	let request = require('request');

	function findData(m0, mp, me, env){
		var s, t;
		env.p = env.text.indexOf(m0, env.p + 1) + m0.length - 1;
		env.p = env.text.indexOf(mp, env.p + 1);
		s = env.p + mp.length;
		env.p = env.text.indexOf(me, env.p + 1);
		t = env.p;
		return env.text.substring(s, t);
	}

	var youbiList = ['日', '月', '火', '水', '木', '金', '土'];
	var pNumList = ['０', '１', '２', '３', '４', '５', '６'];

	function getPeriodList(pStr){
		var pList0 = pStr.split('／');
		var pList1 = new Array();
		var d, p, p1, p2;
		for(var i = 0; i < pList0.length; i++){
			if(pList0[i].indexOf(":") != -1){
				pList0[i] = pList0[i].substring(3);
			}
			d = youbiList.indexOf(pList0[i][0]);
			if(d != -1){
				if(pList0[i].indexOf('-') == -1){
					p = pNumList.indexOf(pList0[i][1]);
					if(p != -1){
						pList1.push([d, p]);
					}
				} else{
					p1 = pNumList.indexOf(pList0[i][1]);
					p2 = pNumList.indexOf(pList0[i][3]);
					for(p = p1; p <= p2; p++){
						pList1.push([d, p]);
					}
				}
			}
		}
		return pList1;
	}

	function parsePageHtml(text) {
		let t = {};
		let env = { 
			p: text.indexOf("授業情報", 0),
			text: text
		};
		t["開講年度"]		= findData("<td", ">", "<", env);
		t["開講箇所"]		= findData("<td", ">", "<", env);
		t["科目名"]			= findData("<td", "div>", "<", env);
		t["担当教員"]		= findData("<td", ">", "<", env);
		t["学期曜日時限"]	= findData("<td", ">", "<", env);
		let tmp = t["学期曜日時限"].split("&nbsp;&nbsp;");
		t["学期"] = tmp[0];
		t["曜日時限"] = tmp[1];
		t["pList"] = getPeriodList(t["曜日時限"]);
		t["科目区分"]		= findData("<td", ">", "<", env);
		t["配当年次"]		= pNumList.indexOf(findData("<td", ">", "<", env)[0]);
		t["単位数"]			= parseInt(findData("<td", ">", "<", env));
		t["使用教室"]			= findData("<td", ">", "<", env);
		t["キャンパス"]			= findData("<td", ">", "<", env);
		t["科目キー"]			= findData("<td", ">", "<", env);
		t["科目クラスコード"]	= findData("<td", ">", "<", env);
		t["授業で使用する言語"]	= findData("<td", ">", "<", env);
		t["コース・コード"]	= findData("<td", ">", "<", env);
		t["大分野名称"]	= findData("<td", ">", "<", env);
		t["中分野名称"]	= findData("<td", ">", "<", env);
		t["小分野名称"]	= findData("<td", ">", "<", env);
		t["レベル"]	= findData("<td", ">", "<", env);
		t["授業形態"]	= findData("<td", ">", "<", env);
		t["pKey"]	= findData('<input type="hidden" name="pKey"', '"', '"', env);
		t["URL"] = "https://www.wsl.waseda.jp/syllabus/JAA104.php?pKey=" + t["pKey"] + "&pLng=jp"
		return t;
	}

	var URIBase = "https://www.wsl.waseda.jp/syllabus/JAA104.php?pLng=jp&pKey=";
	function getClassPage(pid, callback){
		let opt = {
			uri: URIBase + pid
		};
		process.stderr.write("Fetching " + pid + " ...");
		request.get(opt, function(error, res, body){
			if (!error && res.statusCode == 200) {
				process.stderr.write("  200 OK\n");
				callback(parsePageHtml(body));
			} else {
				process.stderr.write("  " + res.statusCode + " ERROR\n");
				callback(null);
			}
		});
	}

	exports.fetch = function(pid, callback) {
		getClassPage(pid, callback);
	};

})(exports, require);
