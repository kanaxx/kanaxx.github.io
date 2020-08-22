javascript:(
    function(){
      title = document.title;
      href = document.location.href;
      canonical = get_canonical();
      console.log('ページタイトル=%s \n href=%s \n カノニカルURL=%s', title, href, canonical);
      alert('ページタイトル：'+title +"\n現在のURL："+href + "\nカノニカルURL：" + canonical);
  
      function get_canonical(){
        links = document.getElementsByTagName("link");
        for ( i in links) {
            if (links[i].rel) {
                if (links[i].rel.toLowerCase() == "canonical") {
                    return links[i].href;
                }
            }
        }
        return "";
      }
    }
  )();
