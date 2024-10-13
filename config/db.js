const AWS = require('aws-sdk');

// AWS 설정
AWS.config.update({
    region: 'ap-northeast-2', // 사용할 리전
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports = dynamoDB;