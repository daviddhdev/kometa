import {
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
  },
  (table) => ({
    volumeIssueUnique: unique().on(table.volume_id, table.issue_number),
  })
);
