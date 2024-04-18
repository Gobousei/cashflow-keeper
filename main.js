
      var refarence = {
          "inside": ["error","その他","仕送り","アルバイト","特別報酬",],
        
          "outside": ["error","その他","食費","日用品費","被服費","美容費","医療費","交際費","娯楽費"]
      };
      var modal = document.getElementById('modal');
      modal.style.display = 'none';


          firebase.initializeApp(firebaseConfig);
          
      const auth  = firebase.auth();
      var db=firebase.database();
      db.isPersistenceEnabled = true
      var uid;
      var data;
      var data;
      var now = new Date();
      var month = Number(now.getMonth())+1;
      var balance;
          //**Firebaseのリセットを行ってからユーザーを取得 */
      var unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        uid = auth.currentUser.uid;
        console.log(uid);
        db.ref('cashflow/'+auth.currentUser.uid).once('value',function (obj){
          if(!obj.val()){
            db.ref('cashflow/'+auth.currentUser.uid).update({
              balance:0,
          });
          }
        })
        db.ref('cashflow/'+auth.currentUser.uid+'/balance').on('value',function (obj){
          balance = obj.val();
          console.log('balance='+balance);
          var balance_doc = document.getElementById('balance');
              balance_doc.innerText='今月の収支：'+balance;
          if(Number(balance)<5000){
              balance_doc.classList.add('has-text-danger');
          }else{
              balance_doc.classList.add('has-text-primary');
          }
        })
        index();
      }else{
        location.href="./index.html";
    }
      // 登録解除
      unsubscribe();
  });

  function index(){
        if(inout==1||inout==2){
        var type;
        var detail;
        var price;

        var options;
        if(inout==1){
          options = refarence.inside;
        }else if(inout==2){
          options = refarence.outside;
        };
        let i=0;
        var lim   = options.length-1;
        const types = document.getElementById('type');
        while(i<lim){
          let now       = options[i+1];
          let add_code  = `<option value="${i+1}">${now}</option>`;
          types.insertAdjacentHTML( 'beforeend', add_code);
          i++;
        };//End create input options
        


    }else if(inout==3){
      db.ref('cashflow/'+auth.currentUser.uid+'/month/'+month+'/data').once('value',function (obj){
        data = obj.val();
        document.getElementById('loading').remove();
        if(!data){
          tbody.innerHTML = '今月分のデータがありません';
        }else{

        const tbody = document.getElementById('tbody');

        
        var inside_option = refarence.inside;
        var outside_option = refarence.outside;
          
          

            let tfoot_color;
            if(Number(balance)<5000){
              tfoot_color = 'has-text-danger';
            }else{
              tfoot_color = 'has-text-primary';
            }
            let last_price = `<th class="${tfoot_color}">${balance}</th><th></th>`;
            document.getElementById('tfoot').insertAdjacentHTML( 'beforeend', last_price);
            var balance_doc = document.getElementById('balance');
            balance_doc.innerText='今月の収支：'+balance;
            if(Number(balance)<5000){
              balance_doc.classList.add('has-text-danger');
            }else{
              balance_doc.classList.add('has-text-primary');
            }


            var lim = data.length;
            let i =0;

            while(i<lim){
              let type = Number(data[i][1]);
              let whitch = Number(data[i][0]);
              let detail = data[i][2];
              let price = data[i][3];
              let date = data[i][4];
              if(detail==0){
                if(whitch==1){
                  detail = inside_option[type];
                }else if(whitch==2){
                  detail = outside_option[type];
                }
              }
              if(whitch==1){
                whitch = 'has-text-success';
              }else if(whitch==2){
                price = price*(-1);
                whitch = 'has-text-danger';
              }
              let add_code = `
                    <tr class="${whitch}">
                        <td>${detail}</td>
                        <td>${price}</td>
                        <td>${date}</td>
                    </tr>`;
                    i++
                    tbody.insertAdjacentHTML( 'beforeend', add_code);
            }
          }
      })
    }
  }

  function show(){
    type    = document.getElementById('type').value;
    detail  = document.getElementById('detail').value;
    price   = document.getElementById('price').value;
    var typenumber  = Number(type);
    var typearray   = refarence.outside;
    var typestring  = typearray[typenumber];
    document.getElementById('typeconfirm').innerText  = typestring;
    document.getElementById('detailconfirm').innerText= detail;
    document.getElementById('priceconfirm').innerText = price;
    modal.style.display = 'flex';
  }

  function hide(){
    modal.style.display = 'none';
  }

  function formsubmit(){
    document.getElementById('submit_button').classList.add('is-loading');
    type    = document.getElementById('type').value;
    detail  = document.getElementById('detail').value;
    price   = document.getElementById('price').value;
    let date = now.getDate();

    var answer = [inout,type,detail,price,date];
    console.log(answer);
    var data;

    db.ref('cashflow/'+auth.currentUser.uid+'/month/'+month+'/data').once('value',function (obj){
      data = obj.val();
      if(!data){
        data=[];
      }
      console.log(data);
      data.push(answer);
      
    db.ref('cashflow/'+auth.currentUser.uid+'/month/'+month).update({data});

    })
    var balance;
    db.ref('cashflow/'+auth.currentUser.uid+'/balance').once('value',function (obj){
      balance = Number(obj.val());
    })
    if(!balance){
      balance = 0;
    }
    if(inout==1){
      var balance = Number(balance) + Number(price);
    }else if(inout==2){
      var balance = Number(balance) - Number(price);
    }
    db.ref('cashflow/'+auth.currentUser.uid).update({balance});
    setTimeout(function () {
      formclear();
  }, 1000);
  
  }
  function formclear(){
    window.location.reload();
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log('ServiceWorker registration successful.');
    }).catch(err => {
      console.log('ServiceWorker registration failed.');
    });
  }
