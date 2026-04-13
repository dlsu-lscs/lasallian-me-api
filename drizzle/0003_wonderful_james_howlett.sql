CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_provider_account_idx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "application_author_id_idx" ON "application" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "application_created_at_idx" ON "application" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "application_updated_at_idx" ON "application" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "application_title_idx" ON "application" USING btree ("title");--> statement-breakpoint
CREATE INDEX "ratings_user_id_idx" ON "ratings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ratings_application_id_idx" ON "ratings" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");