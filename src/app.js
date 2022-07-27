const Koa = require('koa');

const bodyParser = require('koa-bodyparser');

const controller = require('./controller');

const templating = require('./templating');

const rest = require('./rest');

const app = new Koa();

const isProduction = process.env.NODE_ENV === 'production';

// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});

if (!isProduction) {
    // static file support:
    let staticFiles = require('./static-files');
    app.use(staticFiles('/static/', './static'));
}
// parse request body:
app.use(bodyParser());

// add nunjucks as view:
app.use(templating('./views', {
    noCache: !isProduction,
    watch: !isProduction
}));

// bind .rest() for ctx:
app.use(rest.restify());

// add controllers:
app.use(controller());

app.listen(3000);
console.log('app started at port 3000...');

import './fetch'
import './fetchTrend'
