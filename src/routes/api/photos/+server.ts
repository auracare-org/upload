import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/guards';
import { uploadFile, generateUniqueFileName } from '$lib/server/spaces';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const POST: RequestHandler = async (event) => {
	const user = requireAuth(event);

	const formData = await event.request.formData();
	const file = formData.get('file') as File | null;
	const age = formData.get('age') as string | null;
	const gender = formData.get('gender') as string | null;
	const ear = formData.get('ear') as string | null;
	const symptomsRaw = formData.get('symptoms') as string | null;
	const other = formData.get('other') as string | null;

	// Validation
	if (!file) {
		return json({ error: 'File is required' }, { status: 400 });
	}

	if (!age || isNaN(parseInt(age))) {
		return json({ error: 'Valid age is required' }, { status: 400 });
	}

	if (!gender) {
		return json({ error: 'Gender is required' }, { status: 400 });
	}

	if (!ear) {
		return json({ error: 'Ear is required' }, { status: 400 });
	}

	if (!symptomsRaw) {
		return json({ error: 'Symptoms are required' }, { status: 400 });
	}

	// Parse symptoms (expecting JSON array)
	let symptoms: string[];
	try {
		symptoms = JSON.parse(symptomsRaw);
		if (!Array.isArray(symptoms) || symptoms.length === 0) {
			throw new Error('Symptoms must be a non-empty array');
		}
	} catch {
		return json({ error: 'Symptoms must be a valid JSON array of strings' }, { status: 400 });
	}

	// Validate file type (images only)
	if (!file.type.startsWith('image/')) {
		return json({ error: 'Only image files are allowed' }, { status: 400 });
	}

	try {
		// Upload file to DigitalOcean Spaces
		const fileName = generateUniqueFileName(user.id, file.name);
		const imageUrl = await uploadFile(file, fileName);

		// Save metadata to database
		const [photo] = await db
			.insert(table.photo)
			.values({
				userId: user.id,
				imageUrl,
				age: parseInt(age),
				gender,
				ear,
				symptoms,
				other: other || null
			})
			.returning();

		return json({ success: true, photo }, { status: 201 });
	} catch (error) {
		console.error('Upload error:', error);
		return json({ error: 'Failed to upload photo' }, { status: 500 });
	}
};

export const GET: RequestHandler = async (event) => {
	const user = requireAuth(event);

	try {
		const photos = await db
			.select()
			.from(table.photo)
			.where(eq(table.photo.userId, user.id))
			.orderBy(desc(table.photo.uploadedAt));

		return json({ photos });
	} catch (error) {
		console.error('Fetch error:', error);
		return json({ error: 'Failed to fetch photos' }, { status: 500 });
	}
};
