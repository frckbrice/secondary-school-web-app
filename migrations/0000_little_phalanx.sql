CREATE TABLE "anonymous_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type" text NOT NULL,
	"incident_date" timestamp,
	"location" text,
	"description" text NOT NULL,
	"involved_parties" text,
	"witnesses" text,
	"evidence_description" text,
	"urgency_level" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"admin_notes" text,
	"submitted_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"form" text NOT NULL,
	"documents" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp,
	"reviewed_by" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_name" text NOT NULL,
	"parent_name" text NOT NULL,
	"parent_email" text NOT NULL,
	"parent_phone" text NOT NULL,
	"teacher_name" text NOT NULL,
	"subject" text NOT NULL,
	"preferred_date" timestamp NOT NULL,
	"preferred_time" text NOT NULL,
	"purpose" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"confirmed_date" timestamp,
	"confirmed_time" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"inquiry_type" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"submitted_at" timestamp DEFAULT now(),
	"responded_at" timestamp,
	"responded_by" integer,
	"response" text
);
--> statement-breakpoint
CREATE TABLE "contributions" (
	"id" serial PRIMARY KEY NOT NULL,
	"contributor_name" text NOT NULL,
	"contributor_email" text,
	"contributor_phone" text NOT NULL,
	"amount" text NOT NULL,
	"currency" text DEFAULT 'XAF' NOT NULL,
	"payment_provider" text NOT NULL,
	"transaction_id" text,
	"purpose" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"graduation_year" text,
	"is_alumni" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"title_fr" text,
	"description" text NOT NULL,
	"description_fr" text,
	"event_date" timestamp NOT NULL,
	"location" text,
	"category" text NOT NULL,
	"image_url" text,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "file_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"related_type" text NOT NULL,
	"related_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"file_path" text NOT NULL,
	"uploaded_by" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"title_fr" text,
	"description" text,
	"description_fr" text,
	"image_url" text NOT NULL,
	"category" text NOT NULL,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "grade_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacher_id" integer NOT NULL,
	"class_name" text NOT NULL,
	"subject" text NOT NULL,
	"academic_year" text NOT NULL,
	"term" text NOT NULL,
	"grading_period" text NOT NULL,
	"courses_expected" integer DEFAULT 0,
	"courses_done" integer DEFAULT 0,
	"expected_period_hours" integer DEFAULT 0,
	"period_hours_done" integer DEFAULT 0,
	"tp_td_expected" integer DEFAULT 0,
	"tp_td_done" integer DEFAULT 0,
	"is_finalized" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"title_fr" text,
	"content" text NOT NULL,
	"content_fr" text,
	"category" text NOT NULL,
	"image_url" text,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"author_id" integer
);
--> statement-breakpoint
CREATE TABLE "petitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_name" text NOT NULL,
	"student_id" text NOT NULL,
	"class_name" text NOT NULL,
	"email" text NOT NULL,
	"petition_type" text NOT NULL,
	"subject" text,
	"term" text,
	"academic_year" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"requested_action" text NOT NULL,
	"supporting_documents" jsonb,
	"status" text DEFAULT 'submitted' NOT NULL,
	"admin_response" text,
	"response_date" timestamp,
	"submitted_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "school_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"academic_year" text NOT NULL,
	"term" text NOT NULL,
	"total_students" integer NOT NULL,
	"total_teachers" integer NOT NULL,
	"promotion_rate" text,
	"pass_rate" text,
	"enrollment_growth" text,
	"average_class_size" text,
	"total_revenue" text,
	"total_expenses" text,
	"infrastructure_score" text,
	"sporting_events" integer DEFAULT 0,
	"championships_won" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_grades" (
	"id" serial PRIMARY KEY NOT NULL,
	"grade_report_id" integer NOT NULL,
	"student_name" text NOT NULL,
	"gender" text NOT NULL,
	"matricule" text,
	"grade" integer,
	"remarks" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"student_name" text NOT NULL,
	"current_class" text NOT NULL,
	"previous_class" text,
	"academic_year" text NOT NULL,
	"term" text NOT NULL,
	"promoted" boolean DEFAULT false,
	"average_grade" text,
	"attendance_rate" text,
	"disciplinary_issues" integer DEFAULT 0,
	"extracurricular_activities" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_name" text NOT NULL,
	"student_id" text NOT NULL,
	"class_name" text NOT NULL,
	"subject" text NOT NULL,
	"term" text NOT NULL,
	"academic_year" text NOT NULL,
	"continuous_assessment" integer,
	"examination" integer,
	"total_marks" integer,
	"grade" text,
	"position" integer,
	"remarks" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text,
	"class_name" text NOT NULL,
	"gender" text NOT NULL,
	"date_of_birth" timestamp,
	"parent_name" text,
	"parent_email" text,
	"parent_phone" text,
	"address" text,
	"profile_image_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "students_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscriber_name" text NOT NULL,
	"subscriber_email" text,
	"subscriber_phone" text NOT NULL,
	"subscription_type" text NOT NULL,
	"amount" text NOT NULL,
	"payment_provider" text NOT NULL,
	"transaction_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"graduation_year" text,
	"features" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"full_name" text,
	"email" text,
	"phone" text,
	"teacher_subject" text,
	"profile_image_url" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_responded_by_users_id_fk" FOREIGN KEY ("responded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade_reports" ADD CONSTRAINT "grade_reports_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_grades" ADD CONSTRAINT "student_grades_grade_report_id_grade_reports_id_fk" FOREIGN KEY ("grade_report_id") REFERENCES "public"."grade_reports"("id") ON DELETE no action ON UPDATE no action;