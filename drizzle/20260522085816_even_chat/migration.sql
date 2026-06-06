CREATE TYPE "claim_request_status" AS ENUM('PENDING', 'APPROVED', 'DECLINED');--> statement-breakpoint
CREATE TABLE "application_claim_request" (
	"id" serial PRIMARY KEY,
	"application_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"additional_info" text,
	"status" "claim_request_status" DEFAULT 'PENDING'::"claim_request_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "claim_request_application_user_unq" UNIQUE("application_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "application" ADD COLUMN "unclaimed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "claim_request_application_id_idx" ON "application_claim_request" ("application_id");--> statement-breakpoint
CREATE INDEX "claim_request_user_id_idx" ON "application_claim_request" ("user_id");--> statement-breakpoint
CREATE INDEX "claim_request_status_idx" ON "application_claim_request" ("status");--> statement-breakpoint
ALTER TABLE "application_claim_request" ADD CONSTRAINT "claim_request_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "application"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "application_claim_request" ADD CONSTRAINT "claim_request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;