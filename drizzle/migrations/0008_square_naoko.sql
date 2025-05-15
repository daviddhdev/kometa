CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"last_login" timestamp with time zone,
	"password_changed" boolean DEFAULT false,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
