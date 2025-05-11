ALTER TABLE "volumes" ADD COLUMN "aliases" text;--> statement-breakpoint
ALTER TABLE "volumes" ADD COLUMN "deck" text;--> statement-breakpoint
ALTER TABLE "volumes" ADD COLUMN "date_added" varchar(100);--> statement-breakpoint
ALTER TABLE "volumes" ADD COLUMN "date_last_updated" varchar(100);--> statement-breakpoint
ALTER TABLE "volumes" ADD COLUMN "is_favorite" boolean DEFAULT false;