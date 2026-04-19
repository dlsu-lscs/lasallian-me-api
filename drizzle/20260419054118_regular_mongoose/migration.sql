ALTER TABLE "ratings" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_pkey" PRIMARY KEY("user_id","application_id");