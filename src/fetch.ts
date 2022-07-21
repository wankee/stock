import fs = require('fs');
import moment = require('moment');
const axios = require('axios');

let timer = null;

function fetchData() {
    axios.get('https://eq.10jqka.com.cn/open/api/hot_list/v1/hot_stock/a/day/data.txt')
        .then(response => {
            if (response.status === 200 && response.data !== null) {
                // console.log('Response:' + response.status + "/" + response.statusText);
                let now = moment();
                let folder = __dirname + '/../fetched';
                let fold_data = __dirname + '/../data';

                try {
                    if (!fs.existsSync(folder)) {
                        fs.mkdirSync(folder);
                    }

                    fs.writeFile(folder + '/' + now.format("YYYYMMDDHHmmss") + '.txt', JSON.stringify(response.data),
                        err => {
                            if (err) {
                                console.log('writeFile error:' + err);
                            }
                        });

                    let stock_list = response.data.data.stock_list;

                    if (!fs.existsSync(fold_data)) {
                        fs.mkdirSync(fold_data);
                    }

                    let res = new Array();
                    for (let i = 0; i < stock_list.length; i++) {
                        let stock = stock_list[i];
                        let item = [stock.order, stock.code, stock.name];
                        res.push(item)
                    }
                    let output = now.format("YYYYMMDDHHmmss") + ':' + JSON.stringify(res) + '\n';

                    fs.appendFile(fold_data + '/dayhot.txt', output,
                        err => {
                            if (err) {
                                console.log('writeFile error:' + err);
                            }
                        });

                } catch (err) {
                    console.error('fs error:' + err)
                }

            } else {
                console.log('Response:' + response.status + "/" + response.statusText);
            }
        }).catch(error => {
            console.log('axios get error:' + error);
        });
}

let interval = 24 * 60;
let tarminute = 30;
function timeFunc() {
    let now = moment();
    console.log(now);
    console.log(now + '');

    // let target = moment('01:30:00', 'HH:mm:ss');
    // let target = moment('00', 'ss');
    let target = now.clone().hour(14).minute(30).second(0).millisecond(0);

    console.log(target);
    console.log(target + '');

    let ms = target.valueOf() - now.valueOf();
    console.log('left time:' + ms);

    if (ms > -500 && ms < 500) {
        // tarminute = now.minute() - now.minute() % interval + interval;
        // if (tarminute >= 60) tarminute = 0;
        target.add(1, 'day');
        console.log('Trigger fetch,next trigger time:' + target.format('YYYY-MM-DD HH:mm:ss'));
        timer = setTimeout(timeFunc, target.valueOf() - now.valueOf());
        // timer = setTimeout(timeFunc, ms + interval * 60 * 1000);
        fetchData();
    } else {
        // tarminute = now.minute() - now.minute() % interval + interval;
        // if (tarminute >= 60) tarminute = 0;
        // target.minute(tarminute);
        if (ms <= -500) {
            target.add(1, 'day');
        }

        console.log('next trigger time:' + target.format('YYYY-MM-DD HH:mm:ss'));
        timer = setTimeout(timeFunc, target.valueOf() - now.valueOf());
    }
};
timeFunc();
// fetchData();