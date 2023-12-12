const startBtn = document.getElementById("startBtn");
const checkVerify = document.getElementById("verify_test");
const checkUnit = document.getElementById("unit_test");
const YT_DATE = /.+\/\/track.ecwid.com\/youtrack\/issue\/(?<issue>[^\/]+)/;



startBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true }, (tabs) => {
        const tab = tabs[0];
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
            //Парсим страницу YT тикета, чтобы получить значение Ветки
            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id, allFrames: true },
                    func: () => {
                        branch = document.querySelector('body > div.app > div > div > div.app__view > yt-analytics-zone > yt-feature-zone > yt-issue-view > yt-issue-layout > div > div.yt-issue-layout__sidebar-container > div > yt-issue-layout-sidebar > div.yt-flex-box.yt-flex-column.yt-issue-sidebar-container > div > div > yt-issue-fields-panel > div > table > tbody > tr:nth-child(12) > td.yt-issue-key-value-list__column.yt-issue-key-value-list__column_value > span.yt-issue-fields-panel__field-value.ring-link.ring-link_pseudo > span > yt-events-animator > yt-event-animate > span > span > yt-issue-custom-field-simple > button').innerText;
                        title = document.querySelector('body > div.app > div > div > div.app__view > yt-analytics-zone > yt-feature-zone > yt-issue-view > yt-issue-layout > div > div.yt-issue-layout__wrapper > div > yt-issue-layout-body > yt-issue-body > yt-dropzone > div > ng-transclude > yt-analytics-zone > div > yt-events-animator > yt-event-animate:nth-child(1) > h1').innerText;
                        chrome.runtime.sendMessage({ branch: branch, title: title });
                    }
                });
            //Получаем значение ветки и название тикета, создаем группу
            chrome.runtime.onMessage.addListener(function (message) {
                let branch = message.branch;
                let title = message.title;
                const VerifyUrl = 'https://devcity.ecwid.com/buildConfiguration/Tests_UpsourceVerify?branch=' + branch + '&buildTypeTab=overview&mode=builds';
                const UnitUrl = 'https://devcity.ecwid.com/buildConfiguration/Tests_UnitTestCoverage?branch=' + branch + '&buildTypeTab=overview&mode=builds';
                groupTitle = groupTitle + ' ' + title;
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
                });
            });
        } else {
            alert("There are no active tabs");
        }
    });
});

