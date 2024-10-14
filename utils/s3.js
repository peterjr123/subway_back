import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import csv from 'csv-parser';
import dotenv from 'dotenv';

async function readFileFromS3(filename) {
    if (process.env.NODE_ENV !== 'production') {
        dotenv.config();
    }

    const client = new S3Client({
        region: 'ap-northeast-2',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    try {
        const result = await client.send(
            new GetObjectCommand({ Bucket: 'metrodatabucket', Key: filename })
        );

        if (!result.Body) {
            return Promise.reject('Could not fetch any data');
        } else {
            const records = [];
            return new Promise((resolve, reject) => {
                result.Body.pipe(csv())
                    .on('data', data => {
                        records.push(data);
                    })
                    .on('end', () => {
                        resolve(records);
                    })
                    .on('error', error => {
                        console.error(error);
                        reject(error);
                    });
            });
        }
    } catch (error) {
        return Promise.reject(error);
    }
}

export default readFileFromS3