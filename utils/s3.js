import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

async function readFileFromS3(filename) {
    const client = new S3Client({ region: 'ap-northeast-2' });
    try {
        const result = await client.send(new GetObjectCommand({ Bucket: 'metrodatabucket', Key: filename }))
        // TODO access/secret 받고나서 마저 구현하기
        return result;
    } catch (error) {
        console.error(error);
        return undefined;
    }
}

export default readFileFromS3