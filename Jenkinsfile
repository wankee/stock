pipeline {
    agent any

    stages {
        stage('Prepare') {
            steps {
                // dir('/var/www/node/stock') {
                    sh 'cd /var/www/node/stock;pwd;git pull;tsc'
                    // sh 'git pull'
                    // sh 'tsc'
                // }
                // sh 'hexo clean'
                // sh 'cd /var/www/node/stock'
                // sh 'pwd'
                // sh 'git pull'
                // sh 'tsc'
                // sh 'git config --global user.name "jenkins"'
                // sh 'git config --global user.email  "wang24118@qq.com"'
                // sh 'git clone https://github.com/wankee/stock.git .deploy_git'
            }
        }
        // stage('Build') {
        //     steps {
        //         sh 'npm install'
        //         sh 'hexo g'
        //     }
        // }
        // stage('Deploy') {
        //     steps {
        //         sh 'hexo d'
        //     }
        // }
    }
}