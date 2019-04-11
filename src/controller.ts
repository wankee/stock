import fs = require('fs');

// add url-route in /controllers:
function addMapping(router: any, mapping: any) {
    for (var url in mapping) {
        let log = `register URL mapping: ${url}`;
        if (url.startsWith('GET ')) {
            var path = url.substring(4);
            router.get(path, mapping[url]);

        } else if (url.startsWith('POST ')) {
            var path = url.substring(5);
            router.post(path, mapping[url]);
        } else if (url.startsWith('PUT ')) {
            var path = url.substring(4);
            router.put(path, mapping[url]);
        } else if (url.startsWith('DELETE ')) {
            var path = url.substring(7);
            router.del(path, mapping[url]);
        } else {
            log = `invalid URL: ${url}`;
        }
        console.log(`   ${log}`);
    }
}

function addControllers(router: any, dir: string) {
    fs.readdirSync(__dirname + '/' + dir).filter((f: string) => {
        return f.endsWith('.js');
    }).forEach((f: string) => {
        console.log(`process controller: ${f}...`);
        let mapping = require(__dirname + '/' + dir + '/' + f);
        addMapping(router, mapping);
        console.log(``);
    });
}

module.exports = function (dir: string) {
    let
        controllers_dir = dir || 'controllers',
        router = require('koa-router')();
    addControllers(router, controllers_dir);
    return router.routes();
};