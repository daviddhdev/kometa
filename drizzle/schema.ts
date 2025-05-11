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
  (table) => ({
    volumeIssueUnique: unique().on(table.volume_id, table.issue_number),
  })
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
