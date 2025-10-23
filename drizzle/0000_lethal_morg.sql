CREATE TYPE "public"."plan_type" AS ENUM('FAIR', 'RAIN');--> statement-breakpoint
CREATE TYPE "public"."rsvp_status" AS ENUM('JOINED', 'DECLINED');--> statement-breakpoint
CREATE TABLE "event_blocks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"location" text NOT NULL,
	"plan_type" "plan_type" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"description" text,
	"plus_ones" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_verified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "rsvps" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" varchar NOT NULL,
	"event_block_id" varchar NOT NULL,
	"status" "rsvp_status" NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_event_block_id_event_blocks_id_fk" FOREIGN KEY ("event_block_id") REFERENCES "public"."event_blocks"("id") ON DELETE cascade ON UPDATE no action;