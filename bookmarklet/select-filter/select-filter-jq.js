javascript: (
  function () {
    $('select').each(function (i, select) {
      if (!select.id) {
        select.id = select.name + '_' + i;
      }
      $(select).before('<input type="text" data-selectid="' + select.id + '" class="__ft"><br>');
    });

    $('.__ft').on('input', function (ev) {

      let selectid = '#' + $(this).data('selectid');
      console.log(selectid);
      console.log($(selectid).children('option').length);

      let txt = this.value;
      console.log(txt);

      //フィルタした瞬間に選択肢を元に戻すならコメントはずす
      // $(selectid).prop("selectedIndex", 0);

      $(selectid).children('option').each(function (i, e) {
        //必ず出すoption(先頭の選択肢を想定)
        if ($(e).val() == '' || $(e).hasClass('default')) {
          $(e).show();
        } else {
          if ($(e).text().indexOf(txt) != -1) {
            $(e).show();
          } else {
            $(e).hide();
          }
        }
      });
    });
  }
)();
