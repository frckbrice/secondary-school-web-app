ALTER TABLE "achievements" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "file_uploads" ALTER COLUMN "related_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "file_uploads" ALTER COLUMN "uploaded_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "file_uploads" ALTER COLUMN "uploaded_by" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" DROP COLUMN "related_news_id";