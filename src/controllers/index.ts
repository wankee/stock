export = {
    'GET /': async (ctx, next) => {
        ctx.render('index.html');
    }
};
