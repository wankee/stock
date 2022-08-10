import fs = require('fs');
import moment = require('moment');
import Utils from './utils';
const axios = require('axios');
const path = require("path")

/** 保存分时数据 */
function saveTrendData(data: any, date: string, stockId: string) {
    let folder = appRoot + '/fetched/trend/' + stockId;
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    fs.writeFileSync(folder + '/' + date + '.txt', JSON.stringify(data));
}

function fetchHistoryTrend(date: string, stockId: string) {
    let param = new URLSearchParams();
    param.append('Day', date);
    param.append('StockID', stockId);
    param.append('a', 'GetStockTrend');
    param.append('c', 'StockL2History');

    axios.post('https://apphis.longhuvip.com/w1/api/index.php', param, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(response => {
        if (response.status === 200 && response.data !== null) {
            // console.log('Response:' + response.data.code);
            saveTrendData(response.data, date, stockId);

        } else {
            console.log('Response:' + response.status + "/" + response.statusText);
        }
    }).catch(error => {
        console.log('Axios fetchHistoryTrend error:' + error);
    });
}

function generateTrendDataRequest(stockId: string) {
    console.log('fetch before ' + moment().valueOf());
    return axios.get('https://web.ifzq.gtimg.cn/appstock/app/minute/query?code=' + stockId);
}

function generatePopIndex(latestDate: string) {
    console.log('----Generate date:' + latestDate + '----');

    let preClose = 1000;
    let preDate = Utils.preTradeDay(latestDate);

    try {
        let preData = JSON.parse(fs.readFileSync(appRoot + '/data/pop3/' + preDate + '.txt', 'utf8'));
        if (preData !== null && preData.close !== null) {
            preClose = parseFloat(preData.close);
        }
    } catch (err) {
        console.log('Get pre data error:' + err);
    }

    console.log("preClose:" + preClose);

    let res = Utils.generatePopIndex(latestDate, preClose);

    if (res !== null) {
        let folder = path.join(appRoot, '/data/pop3')
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        fs.writeFileSync(folder + '/' + latestDate + '.txt', JSON.stringify(res));
    }
}

async function fetchData() {
    let lines = fs.readFileSync(appRoot + '/data/list.txt', 'utf8').split('\n');

    console.log('Total popular size:' + lines.length);
    // console.log(lines);
    // console.log('Before ' + moment().valueOf());

    let req = new Array();
    let codes = new Array()
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === null || lines[i].length === 0) continue;
        // console.log(lines[i]);
        // console.log('i::' + moment().valueOf());

        // let arr = generateTrendDataRequest(getCode(lines[i]));
        let code = Utils.getCode(lines[i]);
        codes.push(code)
        req.push(axios.get('https://web.ifzq.gtimg.cn/appstock/app/minute/query?code=' + code));
        // console.log('i=>' + moment().valueOf());

    }
    // console.log(codes);

    let latestDate = ''
    await axios.all(req).then(results => {
        console.log('fetch end ' + moment().valueOf() + ' size:' + results.length);

        for (let j = 0; j < results.length; j++) {
            // console.log('j::' + j + ' ' + moment().valueOf());
            let response = results[j];

            let resData = response.data;
            // console.log(resData);
            if (response.status === 200 && resData !== null) {
                // console.log('Response:' + response.status + "/" + response.statusText);
                let trendsObj = resData.data[codes[j]].data;
                let date = trendsObj.date;
                // console.log('date:' + date);

                latestDate = date;
                // console.log('before save data:' + moment().valueOf());
                saveTrendData(resData, date, lines[j]);
                // console.log('after save data:' + moment().valueOf());
            } else {
                console.log('Response:' + response.status + "/" + response.statusText);
            }
        }
    }).catch(error => {
        console.log('Axios fetch all data error:' + error);
    });

    generatePopIndex(latestDate);
    // console.log('End ' + moment().valueOf());
}

let timer = null;
function timeTick() {
    let now = moment();
    console.log(now);

    let target = now.clone().hour(15).minute(35).second(0).millisecond(0);

    console.log(target);

    let ms = target.valueOf() - now.valueOf();
    console.log('Fetch trends left time:' + ms);

    if (ms > -200 && ms < 200) {
        target.add(1, 'day');
        console.log('Trigger fetch trends, next trigger time:' + target.format('YYYY-MM-DD HH:mm:ss'));
        timer = setTimeout(timeTick, target.valueOf() - moment().valueOf());
        fetchData();
    } else {
        if (ms <= -200) {
            target.add(1, 'day');
        }

        console.log('Next fetch trends time:' + target.format('YYYY-MM-DD HH:mm:ss'));
        timer = setTimeout(timeTick, target.valueOf() - moment().valueOf());
    }
};

timeTick();