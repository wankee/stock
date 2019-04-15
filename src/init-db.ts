import parse = require('csv-parse');
import stringify = require('csv-stringify');
import * as fs from 'fs';
import Utils from './utils';
import Fund from './models/Fund';
import Trade from './models/Trade';
import db = require('./db');

db.sync(() => {
    console.log('==>init db ok.');
    initFund();
    // initTrade();
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
                console.log("====" + row[0]); // 1, "string", false
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