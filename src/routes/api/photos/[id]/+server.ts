import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/guards';
import { deleteFile } from '$lib/server/spaces';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const GET: RequestHandler = async (event) => {
	const user = requireAuth(event);
	const photoId = parseInt(event.params.id);

	if (isNaN(photoId)) {
		return json({ error: 'Invalid photo ID' }, { status: 400 });
	}

	try {
		const [photo] = await db
			.select()
			.from(table.photo)
			.where(and(eq(table.photo.id, photoId), eq(table.photo.userId, user.id)));

		if (!photo) {
			return json({ error: 'Photo not found' }, { status: 404 });
		}

		return json({ photo });
	} catch (error) {
		console.error('Fetch error:', error);
		return json({ error: 'Failed to fetch photo' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	const user = requireAuth(event);
	const photoId = parseInt(event.params.id);

	if (isNaN(photoId)) {
		return json({ error: 'Invalid photo ID' }, { status: 400 });
	}

	try {
		// First, get the photo to ensure it belongs to the user and to get the imageUrl
		const [photo] = await db
			.select()
			.from(table.photo)
			.where(and(eq(table.photo.id, photoId), eq(table.photo.userId, user.id)));

		if (!photo) {
			return json({ error: 'Photo not found' }, { status: 404 });
		}

		// Extract the key from the imageUrl
		const url = new URL(photo.imageUrl);
		const key = url.pathname.split('/').slice(2).join('/'); // Remove leading slash and bucket name

		// Delete from DigitalOcean Spaces
		await deleteFile(key);

		// Delete from database
		await db.delete(table.photo).where(eq(table.photo.id, photoId));

		return json({ success: true, message: 'Photo deleted successfully' });
	} catch (error) {
		console.error('Delete error:', error);
		return json({ error: 'Failed to delete photo' }, { status: 500 });
	}
};
