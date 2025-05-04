const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

const s3AccessKey = process.env.S3_ACCESS_KEY;
const s3SecretKey = process.env.S3_SECRET_KEY;
const s3Region = process.env.S3_REGION;
const bucketName = process.env.BUCKET_NAME;

const s3Client = new S3Client({
    region: s3Region,
    credentials: {
        accessKeyId: s3AccessKey,
        secretAccessKey: s3SecretKey,
    },
});

const putS3Object = async (key, filePath, ContentType) => {
    try {
        const fileStream = fs.createReadStream(filePath);

        const putCmd = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileStream,
            ContentType,
        });

        await s3Client.send(putCmd);
        const url = `https://${bucketName}.s3.${s3Region}.amazonaws.com/${key}`;
        fs.unlinkSync(filePath);
        return url;
    } catch (err) {
        console.log("Error", err);
        throw new Error(err);
    }
};

const deleteS3Object = async (url) => {
    try {

        const key = url.replace(`https://${bucketName}.s3.${s3Region}.amazonaws.com/`, "");

        const deleteParams = {
            Bucket: bucketName,
            Key: key,
        };

        const data = await s3Client.send(new DeleteObjectCommand(deleteParams));
        return data;
    } catch (err) {
        console.log("Error", err);
        throw new Error(err);
    }
};

module.exports = {
    putS3Object,
    deleteS3Object,
};