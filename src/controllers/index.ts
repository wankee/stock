export = {
    'GET /': async (ctx, next) => {
        ctx.render('index.html');
    },
    'GET /test.html': async (ctx, next) => {
        ctx.render('test.html');
    }
};
