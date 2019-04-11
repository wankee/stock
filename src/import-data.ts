var parse = require('csv-parse')
var stringify = require('csv-stringify')
var fs = require('fs')
function getObjectClass(obj) {
    if (obj && obj.constructor && obj.constructor.toString) {
        var arr = obj.constructor.toString().match(/function\s*(\w+)/);
        if (arr && arr.length == 2) {
            return arr[1];
        }
    }

    return undefined;
}
var Fund = require('./models/Fund')
fs.createReadStream(__dirname + '/../fund_history.csv')
    .pipe(parse({ delimiter: ',' }, function (err, data) {
        console.log(getObjectClass(data));
        // var rows: any = [];
        // console.log(data);
        for (let row of data) {
            // rows.push({
            //     date: row[0],
            //     amount: row[1],
            //     type: row[2],
            // })
            console.log("====" + row[0]); // 1, "string", false
            Fund.create({
                date: row[0],
                amount: row[1],
                type: row[2],
            });
            console.log("==============");
        }
        // Fund.bulkCreate(rows).then(() => {
        //     return Fund.findAll();
        // }).then(users => {
        //     console.log(users);
        // });
        // console.log("====");
        // Fund.create({
        //     date: data[0],
        //     amount: data[1],
        //     type: data[2],
        // });
    }))