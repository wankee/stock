//gulpfile.js
let gulp = require('gulp');
let ts = require('gulp-typescript');
let tsp = ts.createProject('tsconfig.json'); //使用tsconfig.json文件配置tsc
let exec = require('child_process').exec;

//目录常量
const PATHS = {
    scripts: ['./src/**/*'],
    output: './build',
};

//启动node服务
gulp.task('start-node', function () {
    //通过supervisor监控build目录的js文件，有变化时会自动重启node服务
    let child = exec('supervisor -w build ./build/app.js', {});
    child.stdout.on('data', function (data) {
        console.log(data);
    });

    child.stderr.on('data', function (data) {
        console.log(data);
    });
});

//编译ts文件
gulp.task('build', function () {
    return gulp.src(PATHS.scripts)
        .pipe(tsp())
        .pipe(gulp.dest(PATHS.output));
});

//监视ts文件变化
gulp.task('watch-ts', function () {
    gulp.watch(PATHS.scripts, gulp.series('build'));
});

//默认任务，监视ts文件变化，同时编译ts, 启动node服务
gulp.task('default', gulp.parallel('watch-ts', gulp.series('build', 'start-node')));
