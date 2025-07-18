CREATE TABLE "user_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"profile_image_url" text,
	"bio" text,
	"date_of_birth" timestamp,
	"address" text,
	"website" text,
	"social_links" jsonb,
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "anonymous_reports" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "reviewed_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "contacts" ALTER COLUMN "responded_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "contributions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "file_uploads" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "gallery" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "grade_reports" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "grade_reports" ALTER COLUMN "teacher_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "news" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "news" ALTER COLUMN "author_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "petitions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "school_metrics" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "student_grades" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "student_grades" ALTER COLUMN "grade_report_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "student_progress" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "student_results" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "students" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "profile_image_url" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "profile_image_url";