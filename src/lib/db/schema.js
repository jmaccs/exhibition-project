import { sql } from 'drizzle-orm';
import { 
  sqliteTable, 
  text, 
  integer,
  primaryKey
} from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  userAuthToken: text('userAuthToken').notNull().unique(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
});

export const artworks = sqliteTable('artworks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  creator: text('creator'),
  thumbnail: text('thumbnail'),
  sourceId: integer('sourceId').notNull(),
  source: text('source').notNull(), // 'artic' or 'met'
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
});

export const userCollections = sqliteTable('user_collections', {
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  artworkId: integer('artwork_id')
    .notNull()
    .references(() => artworks.id),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  pk: primaryKey(table.userId, table.artworkId),
}));
