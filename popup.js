const startBtn = document.getElementById("startBtn");
const checkVerify = document.getElementById("verify_test");
const checkUnit = document.getElementById("unit_test");
const YT_DATE = /.+\/\/track.ecwid.com\/youtrack\/issue\/(?<issue>[^\/]+)/;

startBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true }, (tabs) => {
        const tab = tabs[0];
        const group = tab.groupId;
        const url = tab.url;
        //Проверяем, это тикет Youtrack или нет
        let YT = YT_DATE.exec(url);
        //Тут мы получаем тип тикета
        let groupTitle = url[(url.indexOf('issue')) + 6];
        //Тут мы получаем номер тикета
        let i = url.indexOf('-') + 1;
        for (let i = (url.indexOf('-') + 1); !isNaN(url[i]); i++) {
            groupTitle += url[i];
        };
        if (YT.groups.issue) {
            //Парсим страницу YT тикета, чтобы получить значение Ветки и название тикета
            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id, allFrames: true },
                    func: () => {
                        branch = document.querySelector('#simplified-root > div > div > div > div > div.main__a43.flex__b42.wide__a34.ticketPage__e26 > article > div > div > aside > div.sidebar__de9.hasHeader__a13 > div.sidebarContentWrapper__af2.sidebarContentWrapperTwoColumns__c4e > div:nth-child(12) > div > div > div > div.fieldFormTwoColumns__fa5 > span.sidebarField__dde.multiline__d74 > button > span > span').innerText;
                        title = document.querySelector('#simplified-root > div > div > div > div > div.main__a43.flex__b42.wide__a34.ticketPage__e26 > article > div > div > div > div.header__aeb.ticketHeaderSticky__a24 > div.highlighter__ad2.highlighter__f23 > div.heading__b3c > span > div > button > h1').innerText;
                        chrome.runtime.sendMessage({ branch: branch, title: title });

                    }
                });
            //Получаем значение ветки и название тикета
            chrome.runtime.onMessage.addListener(function (message) {
                let branch = message.branch;
                let title = message.title;
                const VerifyUrl = 'https://devcity.ecwid.com/buildConfiguration/Tests_UpsourceVerify?branch=' + branch + '&buildTypeTab=overview&mode=builds';
                const UnitUrl = 'https://devcity.ecwid.com/buildConfiguration/Tests_UnitTestCoverage?branch=' + branch + '&buildTypeTab=overview&mode=builds';
                groupTitle = groupTitle + ' ' + title;
                //Проверяем, что вкладка не в группе, и создаем группу
                if (group == -1) {
                    chrome.tabs.group({ tabIds: tab.id }, function (groupId) {
                        chrome.tabGroups.update(groupId, { collapsed: false, title: groupTitle });
                        //Добавляем в группу вкладку с верифай тестами, если чекбокс нажат
                        if (checkVerify.checked) {
                            chrome.tabs.create({ url: VerifyUrl, active: false }, function (verify) {
                                chrome.tabs.group({ tabIds: verify.id, groupId });
                            });
                        };
                        //Добавляем в группу вкладку с юнит тестами, если чекбокс нажат
                        if (checkUnit.checked) {
                            chrome.tabs.create({ url: UnitUrl, active: false }, function (unit) {
                                chrome.tabs.group({ tabIds: unit.id, groupId });
                            });
                        };
                        window.close();
                    });
                };
            });
        } else {
            alert("There are no active tabs");
        }
    });
});

