export = {
    'GET /': async (ctx, next) => {
        ctx.render('index.html');
    },
    'GET /add.html': async (ctx, next) => {
        ctx.render('add.html');
    },
    'GET /capital-detail.html': async (ctx, next) => {
        ctx.render('capital-detail.html');
    }
};
