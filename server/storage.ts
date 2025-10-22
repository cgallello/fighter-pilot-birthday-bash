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
import { db, mockEq } from "./db";
import { eq as drizzleEq, and, desc } from "drizzle-orm";

// Use mock eq function in development, real eq function in production
const eq = mockEq || drizzleEq;

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
  // Check if we're using the mock database
  private isMockDatabase(): boolean {
    return process.env.DATABASE_URL?.startsWith('file:') || false;
  }

  // Guest operations
  async getGuest(id: string): Promise<Guest | undefined> {
    if (this.isMockDatabase()) {
      // Direct access to mock data for development
      const mockData = (global as any).mockData || require('./db').mockData;
      if (mockData && mockData.guests) {
        return mockData.guests.get(id);
      }
    }
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
    if (this.isMockDatabase()) {
      // Direct handling for mock database
      const mockData = (global as any).mockData || require('./db').mockData;
      if (mockData && mockData.guests) {
        const existing = mockData.guests.get(id);
        if (existing) {
          const updated = { ...existing, ...data, updatedAt: new Date() };
          mockData.guests.set(id, updated);
          return updated;
        }
      }
      return undefined;
    }

    const [guest] = await db
      .update(guests)
      .set(data)
      .where(eq(guests.id, id))
      .returning();
    return guest || undefined;
  }

  // EventBlock operations
  async getAllEventBlocks(): Promise<EventBlock[]> {
    if (this.isMockDatabase()) {
      const mockData = (global as any).mockData;
      if (mockData && mockData.eventBlocks) {
        return Array.from(mockData.eventBlocks.values()).sort((a, b) => a.sortOrder - b.sortOrder);
      }
      return [];
    }
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
    if (this.isMockDatabase()) {
      // Direct filtering for mock database
      const mockData = (global as any).mockData || require('./db').mockData;
      if (mockData && mockData.rsvps) {
        const allRsvps = Array.from(mockData.rsvps.values());
        return allRsvps.filter((rsvp: any) => rsvp.guestId === guestId);
      }
      return [];
    }
    return await db.select().from(rsvps).where(eq(rsvps.guestId, guestId));
  }

  async getRsvpsByEvent(eventBlockId: string): Promise<Rsvp[]> {
    return await db.select().from(rsvps).where(eq(rsvps.eventBlockId, eventBlockId));
  }

  async getAllRsvps(): Promise<Rsvp[]> {
    return await db.select().from(rsvps);
  }

  async getAllRsvpsWithGuests(): Promise<Array<Rsvp & { guest?: Guest }>> {
    if (this.isMockDatabase()) {
      const mockData = (global as any).mockData;
      if (mockData && mockData.rsvps && mockData.guests) {
        const allRsvps = Array.from(mockData.rsvps.values());
        const allGuests = Array.from(mockData.guests.values());
        return allRsvps.map((rsvp: any) => {
          const guest = allGuests.find((g: any) => g.id === rsvp.guestId);
          return { ...rsvp, guest };
        });
      }
      return [];
    }
    const allRsvps = await db.select().from(rsvps);
    const allGuests = await db.select().from(guests);

    return allRsvps.map((rsvp: any) => {
      const guest = allGuests.find((g: any) => g.id === rsvp.guestId);
      return { ...rsvp, guest };
    });
  }

  async upsertRsvp(rsvp: InsertRsvp): Promise<Rsvp> {
    if (this.isMockDatabase()) {
      // Direct mock database handling for upsert
      const mockData = (global as any).mockData;
      if (mockData && mockData.rsvps) {
        const allRsvps = Array.from(mockData.rsvps.values());
        const existing = allRsvps.find((r: any) =>
          r.guestId === rsvp.guestId && r.eventBlockId === rsvp.eventBlockId
        );

        if (existing) {
          // Update existing RSVP
          const updated = { ...existing, status: rsvp.status, updatedAt: new Date() };
          mockData.rsvps.set(existing.id, updated);
          return updated;
        } else {
          // Create new RSVP
          const id = `rsvp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const created = {
            ...rsvp,
            id,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          mockData.rsvps.set(id, created);
          return created;
        }
      }
    }

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
    if (this.isMockDatabase()) {
      const mockData = (global as any).mockData;
      if (mockData && mockData.settings) {
        return mockData.settings.get(key);
      }
      return undefined;
    }
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
