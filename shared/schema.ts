import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const planTypeEnum = pgEnum("plan_type", ["FAIR", "RAIN"]);
export const rsvpStatusEnum = pgEnum("rsvp_status", ["JOINED", "DECLINED"]);

// Guest table
export const guests = pgTable("guests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastVerifiedAt: timestamp("last_verified_at"),
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  createdAt: true,
  phoneVerified: true,
  lastVerifiedAt: true,
});

export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type Guest = typeof guests.$inferSelect;

// EventBlock table
export const eventBlocks = pgTable("event_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  location: text("location").notNull(),
  planType: planTypeEnum("plan_type").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEventBlockSchema = createInsertSchema(eventBlocks)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    startTime: z.string().transform((val) => new Date(val)),
    endTime: z.union([z.string(), z.null(), z.undefined()]).optional().transform((val) => {
      if (!val || val === '') return null;
      return new Date(val);
    }),
    sortOrder: z.number().optional().default(0),
  });

export type InsertEventBlock = z.infer<typeof insertEventBlockSchema>;
export type EventBlock = typeof eventBlocks.$inferSelect;

// RSVP table
export const rsvps = pgTable("rsvps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guestId: varchar("guest_id").notNull().references(() => guests.id, { onDelete: "cascade" }),
  eventBlockId: varchar("event_block_id").notNull().references(() => eventBlocks.id, { onDelete: "cascade" }),
  status: rsvpStatusEnum("status").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertRsvpSchema = createInsertSchema(rsvps).omit({
  id: true,
  updatedAt: true,
});

export type InsertRsvp = z.infer<typeof insertRsvpSchema>;
export type Rsvp = typeof rsvps.$inferSelect;

// Settings table (key-value store)
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const insertSettingSchema = createInsertSchema(settings);

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;
