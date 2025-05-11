CREATE TABLE "reading_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"issue_id" integer NOT NULL,
	"current_page" integer DEFAULT 1,
	"total_pages" integer NOT NULL,
	"last_read_at" timestamp with time zone DEFAULT now(),
	"is_completed" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE no action ON UPDATE no action;