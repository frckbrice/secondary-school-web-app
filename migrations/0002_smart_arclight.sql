CREATE TABLE "achievements" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"title_fr" text,
	"description" text,
	"description_fr" text,
	"image_url" text,
	"category" text,
	"date" timestamp,
	"related_news_id" text,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_fr" text,
	"description" text,
	"description_fr" text,
	"image_url" text,
	"category" text,
	"features" jsonb,
	"equipment" jsonb,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

-- Migration: Change related_id in file_uploads from integer to text
ALTER TABLE "file_uploads" ALTER COLUMN "related_id" TYPE text;
