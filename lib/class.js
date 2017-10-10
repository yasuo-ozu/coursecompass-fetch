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

	function cleanupZenkaku(text){
		text = text.replace(/[！-～]/g,
			function( tmpStr ) {
				return String.fromCharCode( tmpStr.charCodeAt(0) - 0xFEE0 );
			}
		);
		return text.replace(/”/g, "\"")
			.replace(/’/g, "'")
			.replace(/‘/g, "`")
			.replace(/￥/g, "\\")
			.replace(/　/g, " ")
			.replace(/〜/g, "~");
	}

	function cleanupContent(text) {
		text = text.replace(/\r\n/g, "")
			.replace(/&nbsp;/g, "")
			.replace(/<br>/g, "\n")
			.replace(/<BR>/g, "\n")
			.replace(/<\/div>/g, "\n")
			.replace(/<br \/>/g, "\n")
			.replace(/<\/P>/g, "\n")
			.replace(/<\/p>/g, "\n")
			.replace(/<\/table>/g, "\n")
			//.replace(/<\/tr>\n/g, "\n")
			.replace(/　/g, " ")
			.replace(/\n[\s　]*/g, "\n")
			.replace(/[\s　]*\n/g, "\n")
			.replace(/[\n]+\n/g, "\n")
			.replace(/<[^>]*>/g, "");
		return cleanupZenkaku(text);
	}

	function cleanupLine(text) {
		return text
			.replace(/&nbsp;/g,"")
			.replace(/^[\s　]*/, "")
			.replace(/[\s　]*$/, "")
			.replace(/[\r\n]/g, "");
	}

	function cleanupNumber(text) {
		return text.replace(/[^0-9]*/g, "");
	}

	function parsePageHtml(text) {
		let t = {}, ind;
		let env = { 
			p: text.indexOf("授業情報", 0),
			text: text
		};
		let termList = {
			"春季集中": 1,
			"春学期": 2,
			"集中講義（春学期）": 3,
			"春クォーター": 4,
			"夏季集中": 5,
			"夏クォーター": 6,
			"秋学期": 7,
			"集中講義（秋学期）": 8,
			"秋クォーター": 9,
			"冬クォーター": 10,
			"通年": 11,
			"冬季集中": 12,
			"夏秋期": 13,
			"集中（春・秋学期）": 14,
			"通年／秋学期": 15,
			"春学期／秋学期": 16,
			"春学期（アジア）": 17,
			"秋学期（アジア）": 18,
			"夏学期（アジア）": 19,
			"冬学期（アジア）": 20,
			"秋学期（アジア）／冬学期（アジア）": 21,
			"春学期（アジア）／夏学期（アジア）": 22,
			"春夏期": 23,
			"夏シーズン": 24,
			"冬シーズン": 25,
			"": -1
		};
		let mainLanguageList = {
			"日本語": 1,
			"英語": 2,
			"日・英併用": 3,
			"ドイツ語": 4,
			"フランス語": 5,
			"中国語": 6,
			"スペイン語": 7,
			"朝鮮語": 8,
			"ロシア語": 9,
			"イタリア語": 10,
			"その他": 11,
			"指定なし": 12,
			"語学科目": 13,
			"中・英併用": 14,
			"西・英併用": 15,
			"日・独併用": 16,
			"日本語/トルコ語": 17,
			"アラビア語": 18,
			"日本語/ドイツ語": 19,
			"日本語/スペイン語": 20,
			"日・中併用": 21,
			"日本語/朝鮮語": 22
		};
		let typesOfLessonList = {
			"講義": 1,
			"外国語": 2,
			"オンデマンド": 3,
			"演習／ゼミ": 4,
			"対面／オンデマンド": 5,
			"論文": 6,
			"実践／フィールドワーク／インターンシップ／ボランティア": 7,
			"指定なし": 8,
			"実習／実験／実技": 9,
			"研究指導": 10,
			"その他": 11
		};
		let levelList = {
			"初級レベル（入門・導入）": 1,
			"中級レベル（発展・応用）": 2,
			"上級レベル": 3,
			"総仕上げ": 4,
			"修士レベル": 5,
			"博士レベル": 6,
			"指定なし": 7,
			"": -1,
		};
		let campusList = {
			"早稲田": 1,
			"戸山": 2,
			"西早稲田（旧大久保）": 3,
			"喜久井町": 4,
			"生命医科学センター": 5,
			"東伏見": 6,
			"所沢": 7,
			"本庄": 8,
			"北九州": 9,
			"その他": 10,
			"追分": 11,
			"並木": 12,
			"渋谷": 13,
			"府中": 14,
			"小金井": 15,
			"日本橋": 16,
			"板橋": 17,
			"上石神井": 18,
			"上井草": 19,
			"松代": 20,
			"菅平": 21,
			"鴨川": 22,
			"": -1,
		};
		let schoolList = {
			"政治経済学部": 1,
			"法学部": 2,
			"教育学部": 3,
			"商学部": 4,
			"社会科学部": 5,
			"人間科学部": 6,
			"スポーツ科学部": 7,
			"国際教養学部": 8,
			"文化構想学部": 9,
			"文学部": 10,
			"人間科学部（通信教育課程）": 11,
			"基幹理工学部": 12,
			"創造理工学部": 13,
			"先進理工学部": 14,
			"大学院政治学研究科": 15,
			"大学院経済学研究科": 16,
			"大学院法学研究科": 17,
			"大学院文学研究科": 18,
			"大学院商学研究科": 19,
			"大学院教育学研究科": 20,
			"大学院人間科学研究科": 21,
			"大学院社会科学研究科": 22,
			"大学院アジア太平洋研究科": 23,
			"大学院日本語教育研究科": 24,
			"大学院情報生産システム研究科": 25,
			"大学院公共経営研究科": 26,
			"大学院ファイナンス研究科": 27,
			"大学院法務研究科": 28,
			"大学院会計研究科": 29,
			"大学院スポーツ科学研究科": 30,
			"大学院基幹理工学研究科": 31,
			"大学院創造理工学研究科": 32,
			"大学院先進理工学研究科": 33,
			"大学院環境・エネルギー研究科": 34,
			"大学院教職研究科": 35,
			"大学院国際コミュニケーション研究科": 36,
			"大学院経営管理研究科": 37,
			"芸術学校": 38,
			"日本語教育研究センター": 39,
			"留学センター": 40,
			"グローバルエデュケーションセンター": 41
		};
		t["year"]		= cleanupNumber(findData("<td", ">", "<", env)) * 1;
		let school = cleanupLine(findData("<td", ">", "<", env));
		t["school"]		= schoolList[school] || 0;
		if (t["school"] == 0) process.stderr.write("warn: invalid school " + school + "\n");
		t["courseTitle"]	= cleanupLine(findData("<td", "div>", "<", env));
		t["instructor"]		= cleanupLine(findData("<td", ">", "<", env)).split("／");
		let timeDayPeriod = findData("<td", ">", "<", env);
		//t["timeDayPeriod"]	= cleanupLine(timeDayPeriod);
		let tmp = timeDayPeriod.split("&nbsp;&nbsp;");
		t["term"] = termList[tmp[0]] || 0;
		if (t["term"] == 0) process.stderr.write("warn: invalid term " + tmp[0] + "\n");
		//t["dayPeriod"] = tmp[1];
		t["dayPeriod"] = getPeriodList(tmp[1]);
		t["category"]		= findData("<td", ">", "<", env);
		t["eligibleYear"]		= pNumList.indexOf(findData("<td", ">", "<", env)[0]);
		t["credits"]			= parseInt(findData("<td", ">", "<", env));
		t["classroom"]			= cleanupLine(findData("<td", ">", "<", env));
		let campus = cleanupLine(findData("<td", ">", "<", env));
		t["campus"] = campus ? ( campusList[campus] || 0) : -1;
		if (t["campus"] == 0) process.stderr.write("warn: invalid campus " + campus + "\n");
		t["courseKey"]			= findData("<td", ">", "<", env);
		t["courseClassCode"]	= findData("<td", ">", "<", env);
		let mainLanguage = findData("<td", ">", "<", env);
		t["mainLanguage"] = mainLanguageList[mainLanguage] || 0;
		if (t["mainLanguage"] == 0) process.stderr.write("warn: invalid mainLanguage " + mainLanguage + "\n");
		t["courseCode"]	= findData("<td", ">", "<", env);
		t["academyDisciplines"]	= [
			findData("<td", ">", "<", env),
			findData("<td", ">", "<", env),
			findData("<td", ">", "<", env)
		];
		let level = cleanupLine(findData("<td", ">", "<", env));
		t["level"] = levelList[level] || 0;
		if (t["level"] == 0) process.stderr.write("warn: invalid level " + level + "\n");
		let typesOfLesson = cleanupLine(findData("<td", ">", "<", env));
		t["typesOfLesson"]	= typesOfLesson ? ( typesOfLessonList[typesOfLesson] || 0) : -1;
		if (t["typesOfLesson"] == 0) process.stderr.write("warn: invalid typesOfLesson " + typesOfLesson + "\n");
		findData("<h2", ">", "<", env);
		t["lastUpdated"] = findData("<h2", ">最終更新日時：", "<", env);

		let ct = t["content"] = {};
		if ((ind = env.text.indexOf('<tr><th width="20%" scope="row">副題</th>', env.p)) > -1) {
			env.p = ind;
			t["subtitle"] = cleanupContent(findData("<td", ">", "</td>", env));
		} else {
			t["subtitle"] = "";
		}
		if (env.text.indexOf(">授業概要</th>", env.p) > -1) {
			ct["outline"] = cleanupContent(findData("<td class=\"wysiwyg\"", ">", "</td>", env));
		}
		if (env.text.indexOf(">授業の到達目標</th>", env.p) > -1) {
			ct["objective"] = cleanupContent(findData("<td", ">", "</td>", env));
		}
		if (env.text.indexOf(">事前・事後学習の内容</th>", env.p) > -1) {
			ct["studyBeforeOrAfter"] = cleanupContent(findData("<td", ">", "</td>", env));
		}
		if ((ind = env.text.indexOf("授業計画", env.p)) > -1) {
			env.p = ind;
			ind = env.text.indexOf("<table><tbody>", ind);
			if (ind > -1 && ind < env.p + 40) {
				ct["schedule"] = cleanupContent(findData("<td", ">", "</tbody></table></td>", env));
			} else {
				ct["schedule"] = cleanupContent(findData("<td", ">", "</td>", env));
			}
		}
		if (env.text.indexOf(">教科書</th>", env.p) > -1) {
			ct["textbooks"] = cleanupContent(findData("<td", ">", "</td>", env));
		}
		if (env.text.indexOf(">参考文献</th>", env.p) > -1) {
			ct["reference"] = cleanupContent(findData("<td", ">", "</td>", env));
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
			ct["evaluation"] = seiList;
		}
		if (env.text.indexOf(">備考・関連URL</th>", env.p) > -1) {
			ct["note"] = cleanupContent(findData('<td class="wysiwyg"', ">", "</td>", env));
		}

		//t["教科書"] = findData("<td>", "<td>", "</td>", env).replace(/<\/P>/g, "\n").replace(/<[^>]*>/g, "");
		t["pKey"]	= findData('<input type="hidden" name="pKey"', '"', '"', env);
		t["url"] = "https://www.wsl.waseda.jp/syllabus/JAA104.php?pKey=" + t["pKey"] + "&pLng=jp"
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
