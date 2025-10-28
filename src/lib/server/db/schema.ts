import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	location: text('location')
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const photo = pgTable('photo', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id),
	imageUrl: text('image_url').notNull(),
	age: integer('age').notNull(),
	gender: text('gender').notNull(),
	ear: text('ear').notNull(),
	symptoms: text('symptoms').array().notNull(),
	other: text('other'),
	uploadedAt: timestamp('uploaded_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Photo = typeof photo.$inferSelect;
export type PhotoInsert = typeof photo.$inferInsert;
