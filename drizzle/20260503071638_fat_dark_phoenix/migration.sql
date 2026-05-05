ALTER TABLE "application" RENAME COLUMN "is_approved" TO "status";--> statement-breakpoint
ALTER INDEX "application_is_approved_idx" RENAME TO "application_status_idx";