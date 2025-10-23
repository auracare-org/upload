import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { env } from '$env/dynamic/private';

if (!env.DO_SPACES_KEY) throw new Error('DO_SPACES_KEY is not set');
if (!env.DO_SPACES_SECRET) throw new Error('DO_SPACES_SECRET is not set');
if (!env.DO_SPACES_ENDPOINT) throw new Error('DO_SPACES_ENDPOINT is not set');
if (!env.DO_SPACES_REGION) throw new Error('DO_SPACES_REGION is not set');
if (!env.DO_SPACES_BUCKET) throw new Error('DO_SPACES_BUCKET is not set');

const s3Client = new S3Client({
	endpoint: env.DO_SPACES_ENDPOINT,
	region: env.DO_SPACES_REGION,
	credentials: {
		accessKeyId: env.DO_SPACES_KEY,
		secretAccessKey: env.DO_SPACES_SECRET
	}
});

export async function uploadFile(
	file: File,
	key: string
): Promise<string> {
	const buffer = Buffer.from(await file.arrayBuffer());

	const upload = new Upload({
		client: s3Client,
		params: {
			Bucket: env.DO_SPACES_BUCKET,
			Key: key,
			Body: buffer,
			ContentType: file.type,
			ACL: 'public-read'
		}
	});

	await upload.done();

	// Return the public URL
	return `${env.DO_SPACES_ENDPOINT}/${env.DO_SPACES_BUCKET}/${key}`;
}

export async function deleteFile(key: string): Promise<void> {
	const command = new DeleteObjectCommand({
		Bucket: env.DO_SPACES_BUCKET,
		Key: key
	});

	await s3Client.send(command);
}

export function generateUniqueFileName(userId: string, originalFilename: string): string {
	const timestamp = Date.now();
	const randomString = crypto.randomUUID();
	const extension = originalFilename.split('.').pop();
	return `uploads/${userId}/${timestamp}-${randomString}.${extension}`;
}
