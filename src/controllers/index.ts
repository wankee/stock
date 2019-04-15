export = {
    'GET /': async (ctx, next) => {
        ctx.render('index.html');
    },
    'GET /fund_history.html': async (ctx, next) => {
        ctx.render('fund_history.html');
    }
};
