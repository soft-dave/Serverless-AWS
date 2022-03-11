import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { log_error, S3FOLDERS, MEDIA_TYPES } from '../../libs/utils.js';
import { success } from '../../libs/res.js';
import { validate_media } from "../../schemas/file.schema.js";
import { v4 as Guid } from 'uuid';




const getPutURL = async (file, bucket) => {
    const uuid = Guid();
    const s3Key = getS3FolderForUpload(file) + uuid + '-' + file?.name.replace(/\s/g, '');
    const signedUrlExpireSeconds = 60 * 60 * 1;
    const params = {
        Bucket: process.env.BUCKET,
        Key: s3Key,
        ContentType: 'application/octet-stream',
    };
    const command = new PutObjectCommand(params);
    return await getSignedUrl(bucket, command, { expiresIn: signedUrlExpireSeconds });
}

const getS3FolderForUpload = (file) => {
    let mediaType = S3FOLDERS.ROOT;
    if (file.mimetype.startsWith(MEDIA_TYPES.VIDEO)) {
        mediaType = S3FOLDERS.VIDEOS;
    } else if (file.mimetype.startsWith(MEDIA_TYPES.IMAGE)) {
        mediaType = S3FOLDERS.IMAGES;
    } else if (file.mimetype.startsWith(MEDIA_TYPES.AUDIO)) {
        mediaType = S3FOLDERS.AUDIOS;
    } else {
        console.error('Error: getS3FolderForUpload() unknown file type!');
        mediaType = S3FOLDERS.ROOT
    }
    return mediaType;
}

export async function getS3SignedURL(event) {

    try {
        const body = JSON.parse(event.body);
        if (body) {
            validate_media(body);
            const S3Bucket = new S3Client({
                region: process.env.REGION,
            });
            const files = body.files;
            const signedURLs = await Promise.all(files.map(async (file) => {
                const signedURL = await getPutURL(file, S3Bucket);
                return {
                    ...file,
                    url: signedURL
                }
            }))
            return success({
                message: 'Ok',
                data: signedURLs
            })
        } else {
            return log_error({
                error: "Payload is empty for this request.",
            })
        }
    } catch (error) {
        console.log('error', error);
        return log_error(error);
    }

}
