const startBtn = document.getElementById("startBtn");
const checkVerify = document.getElementById("verify_test");
const checkUnit = document.getElementById("unit_test");
const YT_DATE = /.+\/\/track.ecwid.com\/youtrack\/issue\/(?<issue>[^\/]+)/;

startBtn.addEventListener("click",() => {    
    chrome.tabs.query({active: true}, (tabs) => {
        const tab = tabs[0];
        const url = tab.url;
        //Проверяем, это тикет Youtrack или нет
        let YT = YT_DATE.exec(url); 
        //Тут мы получаем тип тикета
        let groupTitle=url[(url.indexOf('issue'))+6];
        //Тут мы получаем номер тикета
        let i = url.indexOf('-')+1;
        for (let i = (url.indexOf('-')+1); !isNaN(url[i]); i++) {
            groupTitle += url[i];
            }  
        if (YT.groups.issue) {
            chrome.tabs.group({tabIds:tab.id},function (groupId){
                chrome.tabGroups.update(groupId, {collapsed:false, title:groupTitle});
            });
        //Смотрим на чекбокс с верифаями и добавляем в созданную группу страницу с верифаями   
        if ( checkVerify.checked ) {
                alert("Добавляю страницу с Верифаями")}
        //Смотрим на чекбокс с юнитами и добавляем в созданную группу страницу с юнитами
        if (checkUnit) {
            alert("Добавляю страницу с Юнитами");
        };
        } else {
            alert("There are no active tabs");
        }
    })
        })   
