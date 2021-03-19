require('dotenv').config()

const S3 = require('aws-sdk/clients/s3')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

let s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
})

function uploadData(json) {

    const uploadParams = {
        Bucket: bucketName,
        Body: JSON.stringify(json),
        Key: 'fileData.json',
    }

    return s3.upload(uploadParams).promise()
}

exports.uploadData = uploadData