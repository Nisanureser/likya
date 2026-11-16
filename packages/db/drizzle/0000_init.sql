CREATE TYPE "public"."age_band" AS ENUM('18-24', '25-34', '35-44', '45-54', '55-64', '65+');--> statement-breakpoint
CREATE TYPE "public"."business_tier" AS ENUM('free', 'sponsored', 'pro');--> statement-breakpoint
CREATE TYPE "public"."contact_channel" AS ENUM('sms', 'push', 'email');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('beginner', 'intermediate', 'experienced', 'expert');--> statement-breakpoint
CREATE TYPE "public"."flag_target" AS ENUM('poi', 'poi_report', 'need', 'user', 'message');--> statement-breakpoint
CREATE TYPE "public"."hike_status" AS ENUM('planned', 'active', 'arrived', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('tr', 'en');--> statement-breakpoint
CREATE TYPE "public"."need_kind" AS ENUM('water', 'food', 'power', 'firstaid', 'lost', 'gear', 'transport', 'lodging', 'buddy', 'sos');--> statement-breakpoint
CREATE TYPE "public"."need_status" AS ENUM('open', 'offered', 'accepted', 'completed', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."offer_status" AS ENUM('offered', 'accepted', 'declined', 'withdrawn', 'completed');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('ios', 'android');--> statement-breakpoint
CREATE TYPE "public"."poi_report_status" AS ENUM('flowing', 'low', 'dry', 'open', 'closed', 'ok', 'damaged', 'gone');--> statement-breakpoint
CREATE TYPE "public"."poi_type" AS ENUM('water', 'lodging', 'camp', 'shop', 'transport', 'signal', 'hazard', 'cache', 'landmark');--> statement-breakpoint
CREATE TABLE "auth_codes" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"email" varchar(254) NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "devices" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" char(26),
	"platform" "platform" NOT NULL,
	"push_token" text,
	"app_version" varchar(32),
	"locale" "locale" DEFAULT 'tr' NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" char(26) PRIMARY KEY NOT NULL,
	"nickname" varchar(32) NOT NULL,
	"avatar_key" varchar(200),
	"age_band" "age_band",
	"experience" "experience_level",
	"languages" text[] DEFAULT '{}'::text[] NOT NULL,
	"about" text,
	"can_help" text[] DEFAULT '{}'::text[] NOT NULL,
	"locale" "locale" DEFAULT 'tr' NOT NULL,
	"visibility" jsonb DEFAULT '{"shareLocation":false,"womenOnly":false,"hideAtNight":true}'::jsonb NOT NULL,
	"helped_count" integer DEFAULT 0 NOT NULL,
	"report_count" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trusted_contacts" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26) NOT NULL,
	"name" varchar(64) NOT NULL,
	"phone" varchar(20),
	"email" varchar(254),
	"channel" "contact_channel" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"email" varchar(254),
	"phone" varchar(20),
	"phone_verified_at" timestamp with time zone,
	"apple_sub" varchar(255),
	"google_sub" varchar(255),
	"is_admin" boolean DEFAULT false NOT NULL,
	"banned_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poi_suggestions" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"trail_id" char(26) NOT NULL,
	"user_id" char(26) NOT NULL,
	"type" "poi_type" NOT NULL,
	"name" jsonb NOT NULL,
	"geom" geometry(Point,4326) NOT NULL,
	"note" text,
	"photo_key" varchar(200),
	"quantity" varchar(50),
	"observed_at" timestamp with time zone NOT NULL,
	"device_created_at" timestamp with time zone NOT NULL,
	"reviewed_at" timestamp with time zone,
	"reviewed_by" char(26),
	"approved_poi_id" char(26),
	"reject_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pois" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"trail_id" char(26) NOT NULL,
	"type" "poi_type" NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"geom" geometry(Point,4326) NOT NULL,
	"stage_id" char(26),
	"track_offset_m" integer,
	"trail_offset_m" integer,
	"distance_from_track_m" integer,
	"is_paid" boolean DEFAULT false NOT NULL,
	"business_id" char(26),
	"seasonality" jsonb,
	"contact" jsonb,
	"derived" jsonb DEFAULT '{"status":null,"lastReportAt":null,"reportCount30d":0,"confidence":0}'::jsonb NOT NULL,
	"created_by" char(26),
	"is_published" boolean DEFAULT true NOT NULL,
	"source" varchar(32) DEFAULT 'seed' NOT NULL,
	"source_ref" varchar(128),
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stages" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"trail_id" char(26) NOT NULL,
	"seq" integer NOT NULL,
	"name" jsonb NOT NULL,
	"start_name" jsonb,
	"end_name" jsonb,
	"distance_m" integer NOT NULL,
	"ascent_m" integer,
	"descent_m" integer,
	"cum_start_m" integer NOT NULL,
	"track" geometry(LineString,4326) NOT NULL,
	"notes" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trails" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb,
	"data_version" varchar(32) DEFAULT '0' NOT NULL,
	"bbox" double precision[],
	"length_m" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "trails_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "poi_reports" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"poi_id" char(26) NOT NULL,
	"user_id" char(26) NOT NULL,
	"status" "poi_report_status" NOT NULL,
	"note" text,
	"photo_key" varchar(200),
	"observed_at" timestamp with time zone NOT NULL,
	"reporter_geom" geometry(Point,4326),
	"distance_to_poi_m" integer,
	"confirmations" integer DEFAULT 0 NOT NULL,
	"flags" integer DEFAULT 0 NOT NULL,
	"device_created_at" timestamp with time zone NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"hidden_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"offer_id" char(26) NOT NULL,
	"sender_id" char(26) NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "need_offers" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"need_id" char(26) NOT NULL,
	"helper_id" char(26) NOT NULL,
	"message" text,
	"status" "offer_status" DEFAULT 'offered' NOT NULL,
	"device_created_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "needs" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26) NOT NULL,
	"trail_id" char(26) NOT NULL,
	"stage_id" char(26),
	"kind" "need_kind" NOT NULL,
	"note" text,
	"photo_key" varchar(200),
	"geom_coarse" geometry(Point,4326),
	"geom_precise" geometry(Point,4326),
	"paid_ok" boolean DEFAULT false NOT NULL,
	"status" "need_status" DEFAULT 'open' NOT NULL,
	"accepted_offer_id" char(26),
	"expires_at" timestamp with time zone NOT NULL,
	"resolved_at" timestamp with time zone,
	"device_created_at" timestamp with time zone NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hikes" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"user_id" char(26) NOT NULL,
	"trail_id" char(26) NOT NULL,
	"start_stage_id" char(26),
	"end_stage_id" char(26),
	"planned_start" timestamp with time zone NOT NULL,
	"planned_eta" timestamp with time zone NOT NULL,
	"status" "hike_status" DEFAULT 'planned' NOT NULL,
	"trusted_contact_ids" char(26)[] DEFAULT '{}'::char(26)[] NOT NULL,
	"user_reminded_at" timestamp with time zone,
	"contact_notified_at" timestamp with time zone,
	"arrived_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "last_known" (
	"user_id" char(26) PRIMARY KEY NOT NULL,
	"hike_id" char(26),
	"geom" geometry(Point,4326) NOT NULL,
	"accuracy_m" real,
	"battery_pct" integer,
	"recorded_at" timestamp with time zone NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "presence" (
	"user_id" char(26) PRIMARY KEY NOT NULL,
	"trail_id" char(26) NOT NULL,
	"stage_id" char(26),
	"geom_coarse" geometry(Point,4326) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"trail_id" char(26) NOT NULL,
	"type" varchar(32) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" jsonb,
	"geom" geometry(Point,4326),
	"contact" jsonb,
	"tier" "business_tier" DEFAULT 'free' NOT NULL,
	"verified_at" timestamp with time zone,
	"owner_user_id" char(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocks" (
	"blocker_id" char(26) NOT NULL,
	"blocked_id" char(26) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flags" (
	"id" char(26) PRIMARY KEY NOT NULL,
	"target_type" "flag_target" NOT NULL,
	"target_id" char(26) NOT NULL,
	"reporter_id" char(26) NOT NULL,
	"reason" varchar(32) NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sync_cursors" (
	"user_id" char(26) NOT NULL,
	"device_id" varchar(64) NOT NULL,
	"trail_slug" varchar(64) NOT NULL,
	"last_pull_at" timestamp with time zone NOT NULL,
	CONSTRAINT "sync_cursors_user_id_device_id_trail_slug_pk" PRIMARY KEY("user_id","device_id","trail_slug")
);
--> statement-breakpoint
CREATE TABLE "sync_log" (
	"item_id" char(26) NOT NULL,
	"user_id" char(26) NOT NULL,
	"device_id" varchar(64) NOT NULL,
	"entity" varchar(32) NOT NULL,
	"op" varchar(16) NOT NULL,
	"version" integer NOT NULL,
	"status" varchar(16) NOT NULL,
	"reason" varchar(200),
	"payload" jsonb,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sync_log_item_id_version_pk" PRIMARY KEY("item_id","version")
);
--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trusted_contacts" ADD CONSTRAINT "trusted_contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poi_suggestions" ADD CONSTRAINT "poi_suggestions_trail_id_trails_id_fk" FOREIGN KEY ("trail_id") REFERENCES "public"."trails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poi_suggestions" ADD CONSTRAINT "poi_suggestions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poi_suggestions" ADD CONSTRAINT "poi_suggestions_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poi_suggestions" ADD CONSTRAINT "poi_suggestions_approved_poi_id_pois_id_fk" FOREIGN KEY ("approved_poi_id") REFERENCES "public"."pois"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pois" ADD CONSTRAINT "pois_trail_id_trails_id_fk" FOREIGN KEY ("trail_id") REFERENCES "public"."trails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pois" ADD CONSTRAINT "pois_stage_id_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pois" ADD CONSTRAINT "pois_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pois" ADD CONSTRAINT "pois_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stages" ADD CONSTRAINT "stages_trail_id_trails_id_fk" FOREIGN KEY ("trail_id") REFERENCES "public"."trails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poi_reports" ADD CONSTRAINT "poi_reports_poi_id_pois_id_fk" FOREIGN KEY ("poi_id") REFERENCES "public"."pois"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poi_reports" ADD CONSTRAINT "poi_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_offer_id_need_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."need_offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need_offers" ADD CONSTRAINT "need_offers_need_id_needs_id_fk" FOREIGN KEY ("need_id") REFERENCES "public"."needs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "need_offers" ADD CONSTRAINT "need_offers_helper_id_users_id_fk" FOREIGN KEY ("helper_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs" ADD CONSTRAINT "needs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs" ADD CONSTRAINT "needs_trail_id_trails_id_fk" FOREIGN KEY ("trail_id") REFERENCES "public"."trails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs" ADD CONSTRAINT "needs_stage_id_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hikes" ADD CONSTRAINT "hikes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hikes" ADD CONSTRAINT "hikes_trail_id_trails_id_fk" FOREIGN KEY ("trail_id") REFERENCES "public"."trails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hikes" ADD CONSTRAINT "hikes_start_stage_id_stages_id_fk" FOREIGN KEY ("start_stage_id") REFERENCES "public"."stages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hikes" ADD CONSTRAINT "hikes_end_stage_id_stages_id_fk" FOREIGN KEY ("end_stage_id") REFERENCES "public"."stages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "last_known" ADD CONSTRAINT "last_known_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "last_known" ADD CONSTRAINT "last_known_hike_id_hikes_id_fk" FOREIGN KEY ("hike_id") REFERENCES "public"."hikes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presence" ADD CONSTRAINT "presence_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presence" ADD CONSTRAINT "presence_trail_id_trails_id_fk" FOREIGN KEY ("trail_id") REFERENCES "public"."trails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presence" ADD CONSTRAINT "presence_stage_id_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."stages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocker_id_users_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocked_id_users_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flags" ADD CONSTRAINT "flags_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_cursors" ADD CONSTRAINT "sync_cursors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_log" ADD CONSTRAINT "sync_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_codes_email_idx" ON "auth_codes" USING btree ("email","created_at");--> statement-breakpoint
CREATE INDEX "devices_user_idx" ON "devices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trusted_contacts_user_idx" ON "trusted_contacts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_uq" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE UNIQUE INDEX "users_apple_uq" ON "users" USING btree ("apple_sub");--> statement-breakpoint
CREATE UNIQUE INDEX "users_google_uq" ON "users" USING btree ("google_sub");--> statement-breakpoint
CREATE INDEX "poi_suggestions_pending_idx" ON "poi_suggestions" USING btree ("trail_id","reviewed_at");--> statement-breakpoint
CREATE INDEX "pois_trail_type_idx" ON "pois" USING btree ("trail_id","type");--> statement-breakpoint
CREATE INDEX "pois_geom_gix" ON "pois" USING gist ("geom");--> statement-breakpoint
CREATE INDEX "pois_updated_idx" ON "pois" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "pois_trail_offset_idx" ON "pois" USING btree ("trail_id","trail_offset_m");--> statement-breakpoint
CREATE UNIQUE INDEX "stages_trail_seq_uq" ON "stages" USING btree ("trail_id","seq");--> statement-breakpoint
CREATE INDEX "stages_track_gix" ON "stages" USING gist ("track");--> statement-breakpoint
CREATE INDEX "poi_reports_poi_time_idx" ON "poi_reports" USING btree ("poi_id","observed_at");--> statement-breakpoint
CREATE INDEX "poi_reports_user_idx" ON "poi_reports" USING btree ("user_id","synced_at");--> statement-breakpoint
CREATE INDEX "messages_offer_idx" ON "messages" USING btree ("offer_id","created_at");--> statement-breakpoint
CREATE INDEX "need_offers_need_idx" ON "need_offers" USING btree ("need_id","status");--> statement-breakpoint
CREATE INDEX "needs_trail_status_idx" ON "needs" USING btree ("trail_id","status","expires_at");--> statement-breakpoint
CREATE INDEX "needs_user_idx" ON "needs" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "needs_geom_gix" ON "needs" USING gist ("geom_coarse");--> statement-breakpoint
CREATE INDEX "hikes_user_idx" ON "hikes" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "hikes_overdue_idx" ON "hikes" USING btree ("status","planned_eta");--> statement-breakpoint
CREATE INDEX "presence_geom_gix" ON "presence" USING gist ("geom_coarse");--> statement-breakpoint
CREATE INDEX "presence_expires_idx" ON "presence" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "businesses_trail_idx" ON "businesses" USING btree ("trail_id","type");--> statement-breakpoint
CREATE INDEX "blocks_pair_idx" ON "blocks" USING btree ("blocker_id","blocked_id");--> statement-breakpoint
CREATE INDEX "flags_target_idx" ON "flags" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "sync_log_user_idx" ON "sync_log" USING btree ("user_id","received_at");