/* pipeline 변수 설정 */
def app

node {
    stage('Checkout') {
            checkout scm
    }

    stage('Ready'){
        echo "Ready to build"
        echo "${env.BUILD_NUMBER}"
        echo "${env.GIT_COMMIT}"
    }

    stage('Build image'){
        app = docker.build("harbor.cu.ac.kr/doorboard/doorboard")
    }

    stage('Push image') {
        docker.withRegistry("https://harbor.cu.ac.kr", "harbor") {
            app.push("latest")
            app.push("${env.BUILD_NUMBER}")
        }
    }

    stage('Kubernetes deploy') {
        sh "kubectl delete -f /services/doorboard/deployment.yaml -n doorboard"
        sh "kubectl apply -f /services/doorboard/deployment.yaml -n doorboard"
    }

    stage('Complete') {
        sh "echo 'The end'"
    }
}