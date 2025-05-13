CREATE TABLE "upcoming_releases" (
	"id" serial PRIMARY KEY NOT NULL,
	"comicvine_issue_id" integer NOT NULL,
	"volume_id" integer NOT NULL,
	"issue_number" varchar(50) NOT NULL,
	"name" varchar(255),
	"store_date" timestamp with time zone NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "upcoming_releases" ADD CONSTRAINT "upcoming_releases_volume_id_volumes_id_fk" FOREIGN KEY ("volume_id") REFERENCES "public"."volumes"("id") ON DELETE no action ON UPDATE no action;