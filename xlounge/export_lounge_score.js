export default () => {  
  const keyOfScore = 'xx_lounge_score';
  createForm();
  resetScore();

  function createForm(){
    if($('#_xxform').length==0){
      let html = `
<nav id="_xxform" class="navbar" role="navigation" aria-label="main navigation">

<div id="xx_lounge_nav" class="navbar-menu">
<div class="navbar-start">
  <div class="navbar-item">
      <label style="width:30px" class="label is-large">第</label>
      <div class="control">
          <input style="width:100px" class="input is-large has-text-centered" type="text" id="_question_no" value="1">
      </div>
      <label style="margin-left:10px;width:40px" class="label is-large">問</label>
      <label style="width:130px;margin-left:30px;" class="label is-large">正解すると</label>
      <div class="control">
          <input style="width:100px" class="input is-large has-text-centered" type="text" id="_question_point" value="1">
      </div>
      <label style="margin-left:10px;width:40px" class="label is-large">点</label>
  </div>
</div>

<div class="navbar-end">
  <div class="navbar-item">
    <div class="buttons">
      <!--<button id="saiten" class="button is-success">採点実施</button>&nbsp;-->
      <button id="save_score" class="button is-success">点数を保存</button>&nbsp;
      <button id="show_score" class="button is-success">点数を集計</button>
    </div>
  </div>
</div>
</div>
</nav>
<div id="modal-scoreboard" class="modal">
<div class="modal-background"></div>
<div class="modal-card">
  <header class="modal-card-head">
  <h1 class="modal-card-title">成績</h1>
  <button class="delete" aria-label="close"></button>
  </header>
  <section class="modal-card-body">
  </section>
  <footer class="modal-card-foot">
  <button class="button cancel">閉じる</button>
  </footer>
</div>
</div>
`;
      $('body').prepend(html);
      $('#saiten').on('click',saiten);
      $('#save_score').on('click',saveScore);
      $('#show_score').on('click',showScore);
      $('button:contains("回答クリア")').on('click', setNextQuestionNo);
      $('button:contains("正解発表")').on('click', saveScore);
      $('#modal-scoreboard').on("click", function() {
        $(this).parents().find('.modal').removeClass('is-active');
      });
    }
  }

  function resetScore(){
    let previous = getStorage(keyOfScore)||[];
    if(previous.length>0){
      showScore();
      if( confirm('以前のスコアが残っていますがクリアしますか？') ){
        localStorage.removeItem(keyOfScore);
      }else{
        setQuestionNo(previous.length+1);
      }
    }
  }

  function saveScore(){
    console.log('save');
    let point = parsePositiveInt($('#_question_point').val());
    let names = saiten();
    let questionNo = getQuestionNo();
    let scores = getStorage(keyOfScore)||[];
    scores[questionNo-1] = {point, names};
    saveStorage(keyOfScore, scores);
  }
  function showScore(){
    console.log('show');
    let scores = getStorage(keyOfScore)||[];
    let result=[];

    scores.forEach((score,q)=>{
      console.log('---Q.%s---',(q+1));
      let point = score.point;
      let names = score.names;
      names.forEach((name,n)=>{
        console.log('%s %s点', name, point);
        if (name in result){
          result[name].count++;
          result[name].point+=point;
        }else{
          result[name]={count:1,point,name};
        }
      });
    });
      
    let v = Object.values(result);
    v.sort(function(a,b){
      if(a.point > b.point) return -1;
      if(a.point < b.point) return 1;
      return 0;
    });

    console.info('◆結果◆');
    let scorehtml = `実施した問題：${scores.length}問<hr>`;
    v.forEach(function(item,i){
      console.info( '%s位：%s 点数：%s 正解数：%s', (i+1), item.name, item.point, item.count );
      scorehtml += `<p><strong> ${(i+1)} 位  ${item.name}</strong>  点数：${item.point} ／正解数：${item.count}</p>`;
    });

    $('#modal-scoreboard').addClass('is-active');
    $('#modal-scoreboard section').html(scorehtml);


    // console.log(result);
  }

  function saiten(){
    let answers = $('div.screen-block').length;
    console.log('回答数：%s', answers);
    let corrects = $('div.screen-block.correct-answer');
    console.log('正解数：%s', corrects.length);
    
    let names = [];
    corrects.each(function(a,b,c){
      name = $(b).find('div.screen-name').text();
      names.push(name);
    });

    return names;
  }

  function parsePositiveInt(v){
    let no = parseInt(v);
    if( isNaN(no) || no<=0){
      return 1;
    }
    return no;
  }
  function getQuestionNo(){
    return parsePositiveInt($('#_question_no').val());
  }
  function setNextQuestionNo(){
    setQuestionNo(getQuestionNo()+1);
  }
  function setQuestionNo(no){
    $('#_question_no').val(no);
  }
  function saveStorage(key,val){
    localStorage.setItem(key, JSON.stringify(val));
  };
  function getStorage(key){
    var obj = localStorage.getItem(key);
    return JSON.parse(obj);
  };

}

