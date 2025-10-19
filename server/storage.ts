import {
  guests,
  eventBlocks,
  rsvps,
  settings,
  type Guest,
  type InsertGuest,
  type EventBlock,
  type InsertEventBlock,
  type Rsvp,
  type InsertRsvp,
  type Setting,
  type InsertSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Guest operations
  getGuest(id: string): Promise<Guest | undefined>;
  getGuestByPhone(phone: string): Promise<Guest | undefined>;
  getAllGuests(): Promise<Guest[]>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: string, data: Partial<InsertGuest>): Promise<Guest | undefined>;

  // EventBlock operations
  getAllEventBlocks(): Promise<EventBlock[]>;
  getEventBlock(id: string): Promise<EventBlock | undefined>;
  createEventBlock(block: InsertEventBlock): Promise<EventBlock>;
  updateEventBlock(id: string, data: Partial<InsertEventBlock>): Promise<EventBlock | undefined>;
  deleteEventBlock(id: string): Promise<void>;
  reorderEventBlocks(blocks: { id: string; sortOrder: number }[]): Promise<void>;

  // RSVP operations
  getRsvpsByGuest(guestId: string): Promise<Rsvp[]>;
  getRsvpsByEvent(eventBlockId: string): Promise<Rsvp[]>;
  getAllRsvps(): Promise<Rsvp[]>;
  getAllRsvpsWithGuests(): Promise<Array<Rsvp & { guest?: Guest }>>;
  upsertRsvp(rsvp: InsertRsvp): Promise<Rsvp>;
  deleteRsvp(guestId: string, eventBlockId: string): Promise<void>;

  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  upsertSetting(setting: InsertSetting): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  // Guest operations
  async getGuest(id: string): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.id, id));
    return guest || undefined;
  }

  async getGuestByPhone(phone: string): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.phone, phone));
    return guest || undefined;
  }

  async getAllGuests(): Promise<Guest[]> {
    return await db.select().from(guests);
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const [guest] = await db.insert(guests).values(insertGuest).returning();
    return guest;
  }

  async updateGuest(id: string, data: Partial<Omit<Guest, 'id' | 'createdAt'>>): Promise<Guest | undefined> {
    const [guest] = await db
      .update(guests)
      .set(data)
      .where(eq(guests.id, id))
      .returning();
    return guest || undefined;
  }

  // EventBlock operations
  async getAllEventBlocks(): Promise<EventBlock[]> {
    return await db.select().from(eventBlocks).orderBy(eventBlocks.sortOrder);
  }

  async getEventBlock(id: string): Promise<EventBlock | undefined> {
    const [block] = await db.select().from(eventBlocks).where(eq(eventBlocks.id, id));
    return block || undefined;
  }

  async createEventBlock(block: InsertEventBlock): Promise<EventBlock> {
    const [created] = await db.insert(eventBlocks).values(block).returning();
    return created;
  }

  async updateEventBlock(
    id: string,
    data: Partial<InsertEventBlock>
  ): Promise<EventBlock | undefined> {
    const [updated] = await db
      .update(eventBlocks)
      .set(data)
      .where(eq(eventBlocks.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEventBlock(id: string): Promise<void> {
    await db.delete(eventBlocks).where(eq(eventBlocks.id, id));
  }

  async reorderEventBlocks(blocks: { id: string; sortOrder: number }[]): Promise<void> {
    await Promise.all(
      blocks.map((block) =>
        db.update(eventBlocks).set({ sortOrder: block.sortOrder }).where(eq(eventBlocks.id, block.id))
      )
    );
  }

  // RSVP operations
  async getRsvpsByGuest(guestId: string): Promise<Rsvp[]> {
    return await db.select().from(rsvps).where(eq(rsvps.guestId, guestId));
  }

  async getRsvpsByEvent(eventBlockId: string): Promise<Rsvp[]> {
    return await db.select().from(rsvps).where(eq(rsvps.eventBlockId, eventBlockId));
  }

  async getAllRsvps(): Promise<Rsvp[]> {
    return await db.select().from(rsvps);
  }

  async getAllRsvpsWithGuests(): Promise<Array<Rsvp & { guest?: Guest }>> {
    const allRsvps = await db.select().from(rsvps);
    const allGuests = await db.select().from(guests);
    
    return allRsvps.map((rsvp) => {
      const guest = allGuests.find((g) => g.id === rsvp.guestId);
      return { ...rsvp, guest };
    });
  }

  async upsertRsvp(rsvp: InsertRsvp): Promise<Rsvp> {
    const [existing] = await db
      .select()
      .from(rsvps)
      .where(and(eq(rsvps.guestId, rsvp.guestId), eq(rsvps.eventBlockId, rsvp.eventBlockId)));

    if (existing) {
      const [updated] = await db
        .update(rsvps)
        .set({ status: rsvp.status, updatedAt: new Date() })
        .where(eq(rsvps.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(rsvps).values(rsvp).returning();
      return created;
    }
  }

  async deleteRsvp(guestId: string, eventBlockId: string): Promise<void> {
    await db
      .delete(rsvps)
      .where(and(eq(rsvps.guestId, guestId), eq(rsvps.eventBlockId, eventBlockId)));
  }

  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async upsertSetting(setting: InsertSetting): Promise<Setting> {
    const [upserted] = await db
      .insert(settings)
      .values(setting)
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: setting.value },
      })
      .returning();
    return upserted;
  }
}

export const storage = new DatabaseStorage();
