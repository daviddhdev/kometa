CREATE TABLE "issues" (
	"id" serial PRIMARY KEY NOT NULL,
	"volume_id" integer,
	"issue_number" integer,
	"title" varchar(255),
	"summary" text,
	"file_path" varchar(512),
	"uploaded_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "volumes" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"publisher" varchar(255),
	"start_year" integer,
	"count_of_issues" integer,
	"description" text,
	"image" varchar(512),
	"site_detail_url" varchar(512)
);
--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_volume_id_volumes_id_fk" FOREIGN KEY ("volume_id") REFERENCES "public"."volumes"("id") ON DELETE no action ON UPDATE no action;