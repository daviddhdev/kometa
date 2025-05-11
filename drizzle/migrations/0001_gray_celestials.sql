ALTER TABLE "issues" ALTER COLUMN "issue_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_volume_id_issue_number_unique" UNIQUE("volume_id","issue_number");