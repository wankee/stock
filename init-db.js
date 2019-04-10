const model = require('./model.js');

// (async () => {
// modeljs.sync().then(() => {
//     console.log('init db ok.');
// });
model.sync(() => {
    console.log('==>init db ok.');
    initDb();
}, (err) => {
    console.log('=====error=====');
});

// process.exit(0);
function initDb() {
    let Trade = model.Trade;
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