import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export function requireAuth(event: RequestEvent) {
	if (!event.locals.user || !event.locals.session) {
		throw error(401, 'Unauthorized');
	}
	return event.locals.user;
}
