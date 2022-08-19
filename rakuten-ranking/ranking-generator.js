// author kanaxx.
  let r10AffConfig = null;
  let r10AffParts = null;
  const applicationId = "1027300763038019149";
  const affiliateId = "04021205.0d23044c.04021206.437bb859";
  const r10ApiUrl = 'https://app.rakuten.co.jp/services/api/IchibaItem/Ranking/20170628?format=json&formatVersion=2';
  const defaultConfig = {display:10, period:"realtime", applicationId, affiliateId};

  window.addEventListener("load", () => {
    if( r10AffParts ){
      window.addEventListener("scroll", showRakutenAffItems);
      showRakutenAffItems();
    }
  });

  function setRakutenAff(){
    r10AffConfig = document.getElementById('rakuten-aff-config');
    r10AffParts = document.getElementById('rakuten-aff-parts');
  }
  setRakutenAff();
  
  function makeApiConfig(){
    const config = defaultConfig??{};

    if(r10AffConfig){
      const f = (p)=>{
        const input = r10AffConfig.querySelector(`input[name="${p}"]`);
        console.log(input);
        if(input){
          return input.value;
        }
      };
      config.genreId = f('genreId')??"0";
      config.applicationId = f('applicationId')??config.applicationId;
      config.affiliateId = f('affiliateId')??config.affiliateId ;
      config.display = f('display')??config.display??10;
    }
    return config;
  }

  function makeApiElements(){
    const items = r10AffParts.querySelectorAll('[class^="raku_"]');
    const params = [];
    items.forEach(function(item) {
      params.push(item.className.replace('raku_',''));
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
    targetTop = trigger.getBoundingClientRect().top;
    console.log('div=%s, windows=%s', targetTop, window.innerHeight);
    return (targetTop <= window.innerHeight);
  }

  function formatDate(datetime){
    const d = new Date(datetime);
    const formatted_date = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() ;
    return formatted_date;
  }

  function showRakutenAffItems(){
    setRakutenAff();
  
    if( !checkRakutenAffItemsArea(r10AffParts) ){
      return;
    }
    window.removeEventListener("scroll", showRakutenAffItems);

    const config = makeApiConfig();
    console.log(config);
    
    const params = makeApiElements();
    console.log(params);
    
    let url = r10ApiUrl;

    for( const name in config){
      console.log(name, config[name]);
      url = url + '&' + name + '=' + config[name];
    }
    if(params.length>0){
      url = url + '&elements=' + params.join();
    }
    
    callRakutenAPI(url).then(response => {
      console.log(response);
      if(response.error){
        console.log('rakuten API returns error');
        r10AffParts.style.display='none';
        return;
      }

      if(lastBuild = response['lastBuildDate']){
        if( e = r10AffParts.querySelector('.raku_lastBuildDate') ){
          e.innerHTML = formatDate(lastBuild);
        }
      }
      const itemHtml = r10AffParts.querySelector('.rakuten-aff-item');
      const r10Items = response.Items;

      for(let i=0; i<r10Items.length; i++){
        const html = itemHtml.cloneNode(true);
        let e = null;

        //link
        if(href = r10Items[i]['affiliateUrl']){
          if( e = html.querySelector('.raku_affiliateUrl') ){
            e.setAttribute('href', href);
          }
        }
        //img
        if(src = r10Items[i]['mediumImageUrls']){
          if( e = html.querySelector('.raku_mediumImageUrls')){
            e.setAttribute('src', src[0]);
          }
        }
        //other
        for(let name in r10Items[i]){
          if( e = html.querySelector('span.raku_' + name) ){
            e.innerHTML = r10Items[i][name];
          }
        }
        r10AffParts.appendChild(html);
        html.style.display = 'block';
        if((i+1) >= config.display){
          break;
        }
      }
    }); 
  }