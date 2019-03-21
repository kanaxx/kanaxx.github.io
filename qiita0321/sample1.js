javascript:(
    function(name){
        var defaultname = 'NANASHI';
        if( !name ){
            //選択の余地がない場合
            // name = defaultname;
            //選択の余地を残す場合
            name = prompt('please input your name', defaultname);
        }
        alert(name +'さんこんにちわ');
    }
)(
    'kanaxx'
)
