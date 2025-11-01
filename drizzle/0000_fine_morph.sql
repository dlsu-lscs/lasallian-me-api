-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "authors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150),
	"email" varchar(150),
	"description" varchar(255),
	"website" text,
	"logo" text,
	CONSTRAINT "authors_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"author_id" integer NOT NULL,
	"description" varchar(255),
	"url" text,
	"preview_images" text[],
	"tags" varchar(50)[]
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150),
	"email" varchar(150),
	"profile_picture" text,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"application_id" integer,
	"comment" varchar(255),
	"is_anonymous" boolean DEFAULT false,
	"score" double precision DEFAULT 0 NOT NULL,
	CONSTRAINT "ratings_score_check" CHECK ((score >= (0.0)::double precision) AND (score <= (5.0)::double precision))
);
--> statement-breakpoint
CREATE TABLE "user_favorites" (
	"user_id" integer NOT NULL,
	"application_id" integer NOT NULL,
	CONSTRAINT "user_favorites_pkey" PRIMARY KEY("user_id","application_id")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;
*/