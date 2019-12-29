// ==ClosureCompiler==
// @output_file_name default.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// @language_out ECMASCRIPT_2017
// ==/ClosureCompiler==
javascript:(
    function(f){
        if(window.jQuery && jQuery().jquery > '3.2') {
            console.log('use jquery');
            f(jQuery);
        }else{
            console.log('load jquery');
            var script = document.createElement('script');
            script.src = '//code.jquery.com/jquery-3.4.1.min.js';
            script.onload = function(){
                var $ = jQuery.noConflict(true);
                f($);
            };
            document.body.appendChild(script);
        }
    }(
    function($,undefined){

        var items = [];
        var groceryList = [];
        var current = '';
        var token = '';
        const wait = 750;//milsec

        if(location.href.match(/www.amazon.co.jp\/afx\/lists\/grocerylists/)){
            var head = document.head.innerHTML;
            if( head.match(/"csrfToken":"([^"]*)"/) ){
                token = RegExp.$1;
                console.log(token);
            }
    
            createForm();
        }else if(location.href.match(/www.amazon.co.jp\/gp\/cart\/view.html/)){
            // createCartForm();
        }else{
            alert('対象ページではありません');
            window.location.href = 'https://www.amazon.co.jp/afx/lists/grocerylists';
            return;
        }
        

        // function createCartForm(){
        //     if( $('div#sc-fresh-container').length > 0 && $('div#sc-fresh-container').is(':visible')){
        //         $('div#sc-fresh-cart-header').append('<button id="_az_deleteall">全部削除</button>');
        //         $('button#_az_deleteall').on('click', function(){freshCartClear();});
        //     }else{
        //         alert('no item in fresh cart');
        //     }
        // }

        function createForm(){
            $('div#left-0')
            .append('<button id="_az_clear">リストを空にする</button><br>')
            .append(
                '<textarea id="_az_asinList" rows="10"></textarea><br>'+
                '<button id="_az_addItem" >リストに追加</button>'
            )
            .append(
                '<hr><br><button id="_az_addCart" >商品をカートに入れる</button>'
            );
            
            $('button#_az_addItem').on('click', function(){addItem()});
            $('button#_az_clear').on('click', function(){ clearItems()});
            $('button#_az_addCart').on('click', function(){addCart()});
            findShoppingList();
        }

        function findShoppingList(){
            $('ul#shopping-list-menu li').each(function(i,e){

                var g = $(e).find('div.shopping-list-nav').first();
                id = g.attr('id').replace('-shopping-list-display','');
                name = g.text().trim();
                groceryList.push({id, name});

                if( $(e).find('div#selectedListIndicator').length>0 ){
                    current = id;
                    console.log(current);
                }
            });

            console.log(groceryList);
        }
        function findItem(){
            items = [];
            var i=$('div.asin-item-grid input[type="hidden"]');
            $('div.asin-item-grid input[type="hidden"]').each(function(i,e){
                var asin = e.id.replace('-list-item-id','');
                var id = $(e).val();
                if( $('div#'+ asin + '-item-container').css('display') != 'none'){
                    items.push({id:id,asin:asin});
                    console.log('%s is visible', asin);
                }else{
                    console.log('%s is not visible',asin);
                }
            });
            console.log(items);
            return items;
            
        }

        async function addCart(){
            var items = findItem();
            var btns = [];
            for(i in items){
                console.log(items[i].asin);
                var span = $('span#' + items[i].asin + '-add-to-cart');
                if(span.is(':visible')){
                    btns.push(span);
                }else{
                    console.log('invisible cart button');
                }
            }
            if(confirm(btns.length + 'の商品をカートに入れますか？')){
                for(i in btns){
                    btns[i].click();
                    await new Promise(resolve => setTimeout(resolve, wait));
                }
                alert('カートに入れました');
            }
            console.log('end of addCart');
        }


        async function clearItems(){
            var items = findItem();
            if( confirm(items.length+'個の商品を買い物リストから削除しますか？')){
                for(i in items){
                    var div = 'div#a-popover-item-popover-content-' + items[i].asin;
                    var span = $(div + ' span[data-action="shopping-list-item-delete"]');
                    console.log(span);
                    span.click();
                    await new Promise(resolve => setTimeout(resolve, wait));
                }
                alert('削除しました');
            }
        }
        async function addItem(){
            var items = findItem();
            var existedAsins = [];
            for(i in items){
                existedAsins.push(items[i].asin);
            }
            var asinList = $('textarea#_az_asinList').val().split("\n")
                .filter(function(v){ return v.trim()!='';})
                .filter(function (x, i, self) {
                    return self.indexOf(x.trim()) === i;
                });
            console.log(asinList);
            $('textarea#_az_asinList').val(asinList.join("\n"));

            if(asinList.length==0){
                alert('ないです');
                return;
            }
            if( confirm(asinList.length +'個の商品を買い物リストに追加しますか？')){
                var added=0;
                for(i in asinList){
                    var inputAsin = asinList[i];
                    if(existedAsins.indexOf(inputAsin)>=0){
                        console.log('duplicated %s', inputAsin);
                        continue;
                    }

                    $('h1#shopping-list-title').text(inputAsin + ' (' + (parseInt(i)+1) + '/' + asinList.length + ')' );
                    var result = await addItemAPI({asin:inputAsin, listID:current});
                    console.log(result);
                    await new Promise(resolve => setTimeout(resolve, 300));
                    added++;
                }
                alert('追加しました');
                if(added>0){
                    window.location.reload(true);
                }
            }
        }
        async function addItemAPI(param){
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            };
            const body = Object.keys(param).map((key)=>key+"="+encodeURIComponent(param[key])).join("&");
            var response = await fetch('https://www.amazon.co.jp/afx/lists/json/shoppinglists/additem', 
                {method:'POST', 'headers':headers, 'body':body, credentials:'same-origin'}
            );

            var json = await response.json();
            return json;
        }
        // async function freshCartClear(){
        //     var btns = $('div#sc-fresh-container div.sc-list-item-content input[type="submit"]');
        //     if(confirm(btns.length) ){
        //         for(i=0; i<btns.length; i++){
        //             btns[i].click();
        //             await new Promise(resolve => setTimeout(resolve, 700));
        //         }
        //     }
        // }
    }
    )
)
