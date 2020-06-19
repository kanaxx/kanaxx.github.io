void ((function (f) {
	if (window.jQuery && jQuery().jquery > '2.0') {
		console.log('use jquery');
		f(jQuery);
	} else {
		console.log('load jquery');
		var script = document.createElement('script');
		script.src = '//code.jquery.com/jquery-3.2.1.min.js';
		script.onload = function () {
			var $ = jQuery.noConflict(true);
			f($);
		};
		document.body.appendChild(script);
	}
})(
	function ($, undefined) {
		$('select').each(function (i, select) {
			//selectにidが無ければ、nameから作り出す
			if (!select.id) {
				select.id = select.name + '_' + i;
			}

			let options = $(select).children('option').length;
			let text = `<input type="text" data-selectid="${select.id}" class="__ft">`;
			let badge = `<span id="${select.id}_hit">${options}</span>/<span>${options}</span>`;
			
			//textboxを突っ込む
			$(select).before(`${text}  ${badge} <br>`);
		});
		
		//追加したテキストボックス全てに適用するイベントハンドラ
		$('input.__ft').on('input', function (ev) {

			let selector = '#' + $(this).data('selectid');
			let selectid = $(selector).attr('id');
			console.log(selector);
			
			let txt = this.value;
			console.log(txt);

			//フィルタした瞬間に選択肢を元に戻すならコメントはずす
			// $(selector).prop("selectedIndex", 0);

			let hit = 0;
			$(selector).children('option').each(function (i, e) {
				if ( isDefaultOption(e) || matchOption(e, txt)) {
					$(e).show();
					hit++;
				}else{
					$(e).hide();
				}
			});
			$(`span#${selectid}_hit`).text(hit);
		});
	
		//デフォルトオプションの判定（システムに合わせて適当に書き換える必要があるかも）
		function isDefaultOption(element){
			return $(element).val() == '' || $(element).hasClass('default');
		}
		//表示する条件(半角全角の調整など必要なことをやるべし)
		function matchOption(element, input){
			return $(element).text().indexOf(input) != -1;
		}
	}
))