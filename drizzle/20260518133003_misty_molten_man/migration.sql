ALTER TABLE "application" ALTER COLUMN "url" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "application" ALTER COLUMN "url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "application" ALTER COLUMN "github_link" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "application" ALTER COLUMN "github_link" DROP NOT NULL;