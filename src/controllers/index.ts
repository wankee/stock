export = {
    'GET /': async (ctx, next) => {
        ctx.render('index.html');
    },
    'GET /add.html': async (ctx, next) => {
        ctx.render('add.html');
    },
    'GET /trade-history.html': async (ctx, next) => {
        ctx.render('trade-history.html');
    },
    'GET /capital-detail.html': async (ctx, next) => {
        ctx.render('capital-detail.html');
    },
    'GET /ths-popular.html': async (ctx, next) => {
        ctx.render('ths-popular.html');
    },
    'GET /backtest.html': async (ctx, next) => {
        ctx.render('backtest.html');
    }
};
