// author:kanaxx.
// see also: https://kanaxx.hatenablog.jp/entry/realtime-ranking-parts
const rakutenAffConfig = {
  accessKey : 'xxx',
  affiliateId : "xxx",
  applicationId : "xxx",
  display : 10,
  genreId:0,
}

let r10AffConfig = null;
let r10AffParts = null;
//const r10ApiUrl = 'https://app.rakuten.co.jp/services/api/IchibaItem/Ranking/20170628?format=json&formatVersion=2';
const r10ApiUrl = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601?format=json&formatVersion=2';


setRakutenAff();
showRakutenAffItems();

function setRakutenAff(){
  r10AffConfig = document.getElementById('rakuten-aff-config');
  r10AffParts = document.getElementById('rakuten-aff-parts');

  if( r10AffParts ){
    window.addEventListener("scroll", showRakutenAffItems);
    console.info('RakutenAff - added scroll event.')
  }
}

function makeApiConfig(conf){
  if(r10AffConfig){
    const f = (conf,p)=>{
      if( input = r10AffConfig.querySelector(`input[name="${p}"]`) ){
        conf[p] = input.value;
      }
    };
    f(conf, 'genreId');
    f(conf, 'applicationId');
    f(conf, 'affiliateId');
    f(conf, 'display');
    f(conf, 'period');
  }
}

function makeApiElements(e){
  const items = e.querySelectorAll('[data-raku]');
  const params = [];
  items.forEach(function(item) {
    params.push(item.dataset.raku);
  });
  return params;
}

async function callRakutenAPI(url) {
  try{
    const response = await fetch(url);
    const json = await response.json();
    return json;
  }catch(err){
    console.log(err);
    return null;
  }
}

function checkRakutenAffItemsArea(trigger){
  if(!trigger){
    return false;
  }
  targetTop = trigger.getBoundingClientRect().top;
  //console.log('div=%s, windows=%s', targetTop, window.innerHeight);
  return (targetTop <= window.innerHeight);
}

function formatDate(datetime){
  const d = new Date(datetime);
  const formatted_date = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() ;
  return formatted_date;
}

function showRakutenAffItems(){
  if( !checkRakutenAffItemsArea(r10AffParts) ){
    return;
  }
  console.info('RakutenAff - start.')

  window.removeEventListener("scroll", showRakutenAffItems);
  console.info('RakutenAff - removed scroll event.')

  makeApiConfig(rakutenAffConfig);
  console.log(rakutenAffConfig);

  const params = makeApiElements(r10AffParts);
  console.log(params);
  
  let url = r10ApiUrl;

  for( const name in rakutenAffConfig){
    // console.log(name, rakutenAffConfig[name]);
    url = url + '&' + name + '=' + rakutenAffConfig[name];
  }
  if(params.length>0){
    url = url + '&elements=' + params.join();
  }

  console.info('RakutenAff - call Rakuten API.')
  callRakutenAPI(url).then(response => {
    console.log(response);
    if(response.error){
      console.log('rakuten API returns error');
      r10AffParts.style.display='none';
      return;
    }

    const itemHtml = r10AffParts.querySelector('.rakuten-aff-item');
    if(!itemHtml){
      return;
    }

    let insertNode = itemHtml;
    const r10Items = response.Items;
    
    if(lastBuild = response['lastBuildDate']){
      if( e = r10AffParts.querySelector('[data-raku="lastBuildDate"]') ){
        e.innerHTML = formatDate(lastBuild);
      }
    }

    for(let i=0; i<r10Items.length; i++){
      const newHtml = itemHtml.cloneNode(true);
      let e = null;

      //link
      ['affiliateUrl','itemUrl','shopUrl'].forEach(n=>{
        if(href = r10Items[i][n]){
          if( e = newHtml.querySelector(`a[data-raku="${n}"]`) ){
            e.setAttribute('href', href);
            e.dataset.raku=`_${n}`;
          }
        }
      });
      
      //img
      ['mediumImageUrls','smallImageUrls'].forEach(n=>{
        if(src = r10Items[i][n]){
          if( e = newHtml.querySelector(`img[data-raku="${n}"]`)){
            e.setAttribute('src', src[0]);
            e.dataset.raku=`_${n}`;
          }
        }
      });
      
      //other
      for(let n in r10Items[i]){
        if( e = newHtml.querySelector(`span[data-raku="${n}"]`) ){
          if( n === 'itemPrice'){
            r10Items[i][n] = new Number(r10Items[i][n]).toLocaleString();
          }
          e.innerHTML = r10Items[i][n];
        }
      }

      insertNode.parentElement.insertBefore(newHtml, insertNode.nextSibling);
      insertNode = newHtml;

      if((i+1) >= rakutenAffConfig.display){
        break;
      }
    }
    //remove default template html
    itemHtml.remove();
    console.info('RakutenAff - end.')
  }); 
}
