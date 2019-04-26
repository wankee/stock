import parse = require('csv-parse');
import * as fs from 'fs';
import Utils from './utils';
import Fund from './models/Fund';
import Trade from './models/Trade';
import db = require('./db');

db.sync(() => {
    console.log('==>init db ok.');
    initFund();
    initTradeFromCSV();
}, (err) => {
    console.log('=====error=====');
});

function initFund() {
    // new Fund().create();
    fs.createReadStream(__dirname + '/../fund_history.csv')
        .pipe(parse({ delimiter: ',' }, async function (err, data) {
            console.log(Utils.getObjectClass(data));
            // var rows: any = [];
            // console.log(data);
            for (let row of data) {
                // rows.push({
                //     date: row[0],
                //     amount: row[1],
                //     type: row[2],
                // })
                console.log("====" + row[0]);
                await Fund.create({
                    date: row[0],
                    amount: row[1],
                    type: row[2],
                });
                console.log("=====after create=========");
            }
            // Fund.bulkCreate(rows)
            // .then(() => {
            //     return Fund.findAll();
            // }).then(users => {
            //     // console.log(users);
            // });
            // console.log("====");
            // Fund.create({
            //     date: data[0],
            //     amount: data[1],
            //     type: data[2],
            // });
        }))
}
function initTradeFromCSV() {
    fs.createReadStream(__dirname + '/../trade_record.csv')
        .pipe(parse({ delimiter: ',' }, async function (err, data) {
            console.log(Utils.getObjectClass(data));
            // console.log(data);
            for (let row of data) {
                // console.log(Utils.getObjectClass(row));
                // console.log(row);
                await Trade.create({
                    date: row[0],
                    code: row[1],
                    name: row[2],
                    price: row[3],
                    shares: row[4],
                    total_price: row[5],
                    total_fee: row[6],
                    commission: row[7],
                    fees: row[8],
                    stamp_duty: row[9],
                    transfer_tax: row[10],
                    dividend_tax: row[11],
                    dividend: row[12],
                    sum: row[13],
                });
                console.log("=====after create=========");
            }
        }))
}

function initTrade() {
    (async () => {

        var cat = await Trade.create({
            code: '123456',
            name: '上汽集团',
            price: 12.30,
            shares: 200,
        });
        console.log('created: ' + JSON.stringify(cat));
        var dog = await Trade.create({
            code: '456987',
            name: '格力电器',
            price: 32.30,
            shares: 600,
        });
        console.log('created: ' + JSON.stringify(dog));
    })();
}