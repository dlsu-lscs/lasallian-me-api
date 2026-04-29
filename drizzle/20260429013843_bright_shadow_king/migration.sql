CREATE TYPE "application_approval_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'REMOVED');--> statement-breakpoint
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
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_provider_account_unq" UNIQUE("provider_id","account_id")
);
--> statement-breakpoint
CREATE TABLE "application" (
	"id" serial PRIMARY KEY,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL UNIQUE,
	"user_id" text NOT NULL,
	"description" text,
	"url" text,
	"preview_images" text[],
	"tags" varchar(50)[],
	"is_approved" "application_approval_status" DEFAULT 'PENDING'::"application_approval_status" NOT NULL,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rating" (
	"user_id" text,
	"application_id" integer,
	"comment" varchar(255),
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"score" double precision DEFAULT 0 NOT NULL,
	CONSTRAINT "rating_pkey" PRIMARY KEY("user_id","application_id"),
	CONSTRAINT "rating_score_check" CHECK ((score >= (0.0)::double precision) AND (score <= (5.0)::double precision))
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
	"impersonated_by" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"website" text,
	"logo" text,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp(6) with time zone,
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
CREATE INDEX "application_user_id_idx" ON "application" ("user_id");--> statement-breakpoint
CREATE INDEX "application_created_at_idx" ON "application" ("created_at");--> statement-breakpoint
CREATE INDEX "application_updated_at_idx" ON "application" ("updated_at");--> statement-breakpoint
CREATE INDEX "application_title_idx" ON "application" ("title");--> statement-breakpoint
CREATE INDEX "application_is_approved_idx" ON "application" ("is_approved");--> statement-breakpoint
CREATE INDEX "rating_application_id_idx" ON "rating" ("application_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "user_favorite_application_id_idx" ON "user_favorite" ("application_id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "rating" ADD CONSTRAINT "rating_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_favorite" ADD CONSTRAINT "user_favorite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_favorite" ADD CONSTRAINT "user_favorite_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application"("id") ON DELETE CASCADE;