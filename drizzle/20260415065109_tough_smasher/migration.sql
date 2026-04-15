CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application" (
	"id" serial PRIMARY KEY,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"author_id" integer NOT NULL,
	"description" text,
	"url" text,
	"preview_images" text[],
	"tags" varchar(50)[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "author" (
	"id" serial PRIMARY KEY,
	"name" varchar(150) NOT NULL,
	"email" varchar(150) NOT NULL CONSTRAINT "authors_email_key" UNIQUE,
	"description" text,
	"website" text,
	"logo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" serial PRIMARY KEY,
	"user_id" text,
	"application_id" integer,
	"comment" varchar(255),
	"is_anonymous" boolean DEFAULT false,
	"score" double precision DEFAULT 0 NOT NULL,
	CONSTRAINT "ratings_score_check" CHECK ((score >= (0.0)::double precision) AND (score <= (5.0)::double precision))
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_favorite" (
	"user_id" text,
	"application_id" integer,
	CONSTRAINT "user_favorite_pkey" PRIMARY KEY("user_id","application_id")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "account_provider_account_idx" ON "account" ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "application_author_id_idx" ON "application" ("author_id");--> statement-breakpoint
CREATE INDEX "application_created_at_idx" ON "application" ("created_at");--> statement-breakpoint
CREATE INDEX "application_updated_at_idx" ON "application" ("updated_at");--> statement-breakpoint
CREATE INDEX "application_title_idx" ON "application" ("title");--> statement-breakpoint
CREATE INDEX "ratings_user_id_idx" ON "ratings" ("user_id");--> statement-breakpoint
CREATE INDEX "ratings_application_id_idx" ON "ratings" ("application_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "user_favorite_application_id_idx" ON "user_favorite" ("application_id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "applications_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "author"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_favorite" ADD CONSTRAINT "user_favorite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_favorite" ADD CONSTRAINT "user_favorite_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application"("id") ON DELETE CASCADE;