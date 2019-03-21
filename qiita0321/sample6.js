javascript:(
    function(name){
        var defaultname = 'NANASHI';
        if( !name ){
            name = prompt('please input your name', defaultname);
        }
        
        fetch('https://kanaxx.github.io/qiita0321/userlist.json')
        .then((response)=>{return response.json()})
        .then( (users)=>{
            console.log(users);
            users = users.reverse();
            div = document.createElement("div");
            formdom = 
            '<div style="margin:30px">'+
            'ユーザ選択 <select id="newmyselect"><option></option></select>'+
            '<button id="newmybutton">実行</button>'+
            '</div>';

            div.innerHTML = formdom;
            document.body.appendChild(div);

            myselect = document.getElementById('newmyselect');

            document.getElementById("newmybutton").addEventListener("click", function() {
                showName();
            }, false);

            for(i=0; i<users.length; i++){
                var opt = document.createElement("option");
                opt.value = users[i].name;
                var str = document.createTextNode(users[i].namejp);
                opt.appendChild(str);
                if( name == opt.value){
                    opt['selected']=true;
                }
                myselect.insertBefore(opt, myselect.options[0]);
            }
        });

        function showName(){
            myselect = document.getElementById('newmyselect');
            name = myselect.options[myselect.selectedIndex].value;
            namejp = myselect.options[myselect.selectedIndex].text;
            alert(namejp + '(' + name + ')さん、こんにちわ');
        }
    }
)(
    'user2'
)
