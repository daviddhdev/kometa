import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const volumes = pgTable("volumes", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  publisher: varchar("publisher", { length: 255 }),
  start_year: integer("start_year"),
  count_of_issues: integer("count_of_issues"),
  description: text("description"),
  image: varchar("image", { length: 512 }),
  site_detail_url: varchar("site_detail_url", { length: 512 }),
  aliases: text("aliases"),
  deck: text("deck"),
  date_added: varchar("date_added", { length: 100 }),
  date_last_updated: varchar("date_last_updated", { length: 100 }),
  is_favorite: boolean("is_favorite").default(false),
});

export const issues = pgTable(
  "issues",
  {
    id: serial("id").primaryKey(),
    volume_id: integer("volume_id").references(() => volumes.id),
    issue_number: integer("issue_number").notNull(),
    title: varchar("title", { length: 255 }),
    summary: text("summary"),
    file_path: varchar("file_path", { length: 512 }),
    uploaded_at: timestamp("uploaded_at", { withTimezone: true }).defaultNow(),
    is_read: boolean("is_read").default(false),
  },
  (table) => [unique().on(table.volume_id, table.issue_number)]
);

export const reading_progress = pgTable("reading_progress", {
  id: serial("id").primaryKey(),
  issue_id: integer("issue_id")
    .references(() => issues.id)
    .notNull(),
  current_page: integer("current_page").default(1),
  total_pages: integer("total_pages").notNull(),
  last_read_at: timestamp("last_read_at", { withTimezone: true }).defaultNow(),
  is_completed: boolean("is_completed").default(false),
});

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const collection_volumes = pgTable(
  "collection_volumes",
  {
    id: serial("id").primaryKey(),
    collection_id: integer("collection_id")
      .references(() => collections.id)
      .notNull(),
    volume_id: integer("volume_id")
      .references(() => volumes.id)
      .notNull(),
    added_at: timestamp("added_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [unique().on(table.collection_id, table.volume_id)]
);

export const upcoming_releases = pgTable("upcoming_releases", {
  id: serial("id").primaryKey(),
  comicvine_issue_id: integer("comicvine_issue_id").notNull(),
  volume_id: integer("volume_id")
    .references(() => volumes.id)
    .notNull(),
  issue_number: varchar("issue_number", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }),
  store_date: timestamp("store_date", { withTimezone: true }).notNull(),
  last_updated: timestamp("last_updated", { withTimezone: true }).defaultNow(),
  cover_image: varchar("cover_image", { length: 512 }),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  is_admin: boolean("is_admin").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  last_login: timestamp("last_login", { withTimezone: true }),
  password_changed: boolean("password_changed").default(false),
});

export const push_subscriptions = pgTable(
  "push_subscriptions",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id")
      .references(() => users.id)
      .notNull(),
    endpoint: varchar("endpoint", { length: 512 }).notNull(),
    p256dh: varchar("p256dh", { length: 255 }).notNull(),
    auth: varchar("auth", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [unique().on(table.user_id, table.endpoint)]
);
