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

	function cleanupContent(text) {
		return text.replace(/\r\n/g, "")
			.replace(/&nbsp;/g, "")
			.replace(/<br>/g, "\n")
			.replace(/<BR>/g, "\n")
			.replace(/<\/div>/g, "\n")
			.replace(/<br \/>/g, "\n")
			.replace(/<\/P>/g, "\n")
			.replace(/<\/p>/g, "\n")
			.replace(/<\/table>/g, "\n")
			//.replace(/<\/tr>\n/g, "\n")
			.replace(/<[^>]*>/g, "");
	}

	function parsePageHtml(text) {
		let t = {}, ind;
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
		findData("<h2", ">", "<", env);
		t["最終更新日時"] = findData("<h2", ">最終更新日時：", "<", env);

		if ((ind = env.text.indexOf('<tr><th width="20%" scope="row">副題</th>', env.p)) > -1) {
			env.p = ind;
			t["副題"] = cleanupContent(findData("<td", ">", "</td>", env));
		}
		if (env.text.indexOf(">授業概要</th>", env.p) > -1) {
			t["授業概要"] = cleanupContent(findData("<td class=\"wysiwyg\"", ">", "</td>", env));
		}
		if (env.text.indexOf(">授業の到達目標</th>", env.p) > -1) {
			t["授業の到達目標"] = cleanupContent(findData("<td", ">", "</td>", env));
		}
		if (env.text.indexOf(">事前・事後学習の内容</th>", env.p) > -1) {
			t["事前・事後学習の内容"] = cleanupContent(findData("<td", ">", "</td>", env));
		}
		if ((ind = env.text.indexOf("授業計画", env.p)) > -1) {
			env.p = ind;
			ind = env.text.indexOf("<table><tbody>", ind);
			if (ind > -1 && ind < env.p + 40) {
				t["授業計画"] = cleanupContent(findData("<td", ">", "</tbody></table></td>", env));
			} else {
				t["授業計画"] = cleanupContent(findData("<td", ">", "</td>", env));
			}
		}
		if (env.text.indexOf(">教科書</th>", env.p) > -1) {
			t["教科書"] = cleanupContent(findData("<td", ">", "</td>", env));
		}
		if (env.text.indexOf(">参考文献</th>", env.p) > -1) {
			t["参考文献"] = cleanupContent(findData("<td", ">", "</td>", env));
		}
		if (env.text.indexOf(">成績評価方法</th>", env.p) > -1) {
			findData('<th width="20%" scope="row">', "成績評価方法", "</th>", env);
			let seiList = [];
			while (seiList.length < 10 && (ind = env.text.indexOf("<td width=\"90%\">", env.p)) > -1) {
				let se = [];
				se.push(cleanupContent(findData('<tr><td nowrap="nowrap" valign="top" style="text-align:right;"', ">", ":</td>", env)));
				ind = env.text.indexOf("％", env.p);
				if (ind > -1 && ind < env.p + 60) {
					se.push(cleanupContent(findData('<td align="center" valign="top">', "\n", "％", env)));
				} else {
					se.push("-");
					findData('<td align="center" valign="top"', ">", "</td>", env);
				}
				se.push(cleanupContent(findData('<td width="90%"', ">", "</td></tr>", env)));
				seiList.push(se);
			}
			if (seiList.length == 0) {
				seiList = cleanupContent(findData("<td", ">", "</td>", env));
			}
			t["成績評価方法"] = seiList;
		}
		if (env.text.indexOf(">備考・関連URL</th>", env.p) > -1) {
			t["備考・関連URL"] = cleanupContent(findData('<td class="wysiwyg"', ">", "</td>", env));
		}

		//t["教科書"] = findData("<td>", "<td>", "</td>", env).replace(/<\/P>/g, "\n").replace(/<[^>]*>/g, "");
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
