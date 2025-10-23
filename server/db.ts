import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let db: any;
let pool: any;
let mockData: any = null;

// Check if using local database for development
if (process.env.DATABASE_URL.startsWith('file:')) {
  // For development, we'll use an in-memory mock for simplicity
  console.log('Using mock database for development');

  // Mock database for testing
  mockData = {
    guests: new Map([
      ['test-guest-1', {
        id: 'test-guest-1',
        name: 'Test Pilot',
        phone: '+15551234567',
        description: 'Experienced test pilot ready for missions!',
        phoneVerified: true,
        plusOnes: 1,
        lastVerifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }],
      ['test-guest-2', {
        id: 'test-guest-2',
        name: 'Test Pilot',
        phone: '+17327319298',
        description: 'Experienced test pilot ready for missions!',
        phoneVerified: true,
        plusOnes: 1,
        lastVerifiedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }]
    ]),
    eventBlocks: new Map([
      ['fair-1', { id: 'fair-1', title: 'Mission Briefing', description: 'Welcome and mission overview', startTime: '14:00', endTime: '14:30', location: 'Command Center', planType: 'FAIR', sortOrder: 1, createdAt: new Date(), updatedAt: new Date() }],
      ['fair-2', { id: 'fair-2', title: 'Flight Training', description: 'Simulator time and training exercises', startTime: '14:30', endTime: '16:00', location: 'Flight Deck', planType: 'FAIR', sortOrder: 2, createdAt: new Date(), updatedAt: new Date() }],
      ['fair-3', { id: 'fair-3', title: 'Cake & Celebration', description: 'Birthday celebration and cake', startTime: '16:00', endTime: '17:00', location: 'Mess Hall', planType: 'FAIR', sortOrder: 3, createdAt: new Date(), updatedAt: new Date() }],
      ['rain-1', { id: 'rain-1', title: 'Indoor Mission Briefing', description: 'Welcome and mission overview (indoor)', startTime: '14:00', endTime: '14:30', location: 'Indoor Command Center', planType: 'RAIN', sortOrder: 1, createdAt: new Date(), updatedAt: new Date() }],
      ['rain-2', { id: 'rain-2', title: 'Indoor Activities', description: 'Games and activities', startTime: '14:30', endTime: '16:00', location: 'Recreation Room', planType: 'RAIN', sortOrder: 2, createdAt: new Date(), updatedAt: new Date() }],
      ['rain-3', { id: 'rain-3', title: 'Cake & Celebration', description: 'Birthday celebration and cake (indoor)', startTime: '16:00', endTime: '17:00', location: 'Indoor Mess Hall', planType: 'RAIN', sortOrder: 3, createdAt: new Date(), updatedAt: new Date() }]
    ]),
    rsvps: new Map(),
    settings: new Map([
      ['eventTitle', { key: 'eventTitle', value: 'F-35 Fighter Pilot Birthday Bash', createdAt: new Date(), updatedAt: new Date() }],
      ['eventDescription', { key: 'eventDescription', value: 'Join us for an epic birthday celebration with a Top Gun theme!', createdAt: new Date(), updatedAt: new Date() }]
    ])
  };

  // Mock eq function to work with Drizzle ORM
  (global as any).mockEq = (column: any, value: any) => {
    if (column === schema.guests.id) {
      mockConditionContext.guestId = value;
    } else if (column === schema.guests.phone) {
      mockConditionContext.guestPhone = value;
    } else if (column === schema.settings.key) {
      mockConditionContext.settingKey = value;
    } else if (column === schema.rsvps.guestId) {
      mockConditionContext.guestId = value;
    } else if (column === schema.rsvps.eventBlockId) {
      mockConditionContext.eventBlockId = value;
    }
    console.log(`[MOCK_EQ] Setting condition for ${column?.name || 'unknown'} = ${value}`);
    return { column, value };
  };

  // Mock eq function - simplified approach without monkey patching

  // Mock Drizzle ORM interface with better filtering support
  let mockConditionContext: any = {};

  db = {
    select: (columns?: any) => ({
      from: (table: any) => {
        let whereCondition: any = null;
        const selectBuilder = {
          where: (condition: any) => {
            whereCondition = condition;
            return selectBuilder;
          },
          orderBy: (...order: any[]) => selectBuilder,
          leftJoin: (...joins: any[]) => selectBuilder,
          then: (resolve: any) => {
            let results: any[] = [];

            if (table === schema.guests) {
              results = Array.from(mockData.guests.values());
            } else if (table === schema.eventBlocks) {
              results = Array.from(mockData.eventBlocks.values()).sort((a, b) => a.sortOrder - b.sortOrder);
            } else if (table === schema.rsvps) {
              results = Array.from(mockData.rsvps.values());
            } else if (table === schema.settings) {
              results = Array.from(mockData.settings.values());
            }

            // Apply filtering based on the stored condition context
            if (whereCondition && table === schema.rsvps && mockConditionContext.guestId) {
              results = results.filter((rsvp: any) => rsvp.guestId === mockConditionContext.guestId);
              mockConditionContext = {}; // Reset after use
            } else if (whereCondition && table === schema.guests && mockConditionContext.guestId) {
              results = results.filter((guest: any) => guest.id === mockConditionContext.guestId);
              mockConditionContext = {}; // Reset after use
            } else if (whereCondition && table === schema.guests && mockConditionContext.guestPhone) {
              console.log(`[MOCK_DB] Filtering guests by phone: ${mockConditionContext.guestPhone}`);
              results = results.filter((guest: any) => guest.phone === mockConditionContext.guestPhone);
              console.log(`[MOCK_DB] Found ${results.length} guests with phone ${mockConditionContext.guestPhone}`);
              mockConditionContext = {}; // Reset after use
            } else if (whereCondition && table === schema.settings && mockConditionContext.settingKey) {
              results = results.filter((setting: any) => setting.key === mockConditionContext.settingKey);
              mockConditionContext = {}; // Reset after use
            }

            return Promise.resolve(results).then(resolve);
          }
        };
        return selectBuilder;
      }
    }),
    insert: (table: any) => ({
      values: (data: any) => ({
        returning: () => {
          // Generate unique ID for each table type
          let id: string;
          if (table === schema.guests) {
            id = data.id || `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          } else if (table === schema.eventBlocks) {
            id = data.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          } else if (table === schema.rsvps) {
            id = data.id || `rsvp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          } else {
            id = data.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          }

          const item = { ...data, id, createdAt: new Date(), updatedAt: new Date() };

          if (table === schema.guests) {
            mockData.guests.set(id, item);
            console.log(`[MOCK_DB] Created new guest with ID: ${id}, phone: ${item.phone}, plusOnes: ${item.plusOnes}`);
          } else if (table === schema.eventBlocks) {
            mockData.eventBlocks.set(id, item);
          } else if (table === schema.rsvps) {
            mockData.rsvps.set(id, item);
          } else if (table === schema.settings) {
            mockData.settings.set(data.key, item);
          }

          return Promise.resolve([item]);
        }
      })
    }),
    update: (table: any) => ({
      set: (data: any) => ({
        where: (condition: any) => ({
          returning: () => {
            if (table === schema.guests) {
              const items = Array.from(mockData.guests.values());
              // Find the guest with matching ID from the where condition context
              const existing = items.find((item: any) => item.id === mockConditionContext.guestId);
              if (existing) {
                const updated = { ...existing, ...data, updatedAt: new Date() };
                mockData.guests.set(updated.id, updated);
                mockConditionContext = {}; // Reset after use
                return Promise.resolve([updated]);
              }
              mockConditionContext = {}; // Reset after use
            } else if (table === schema.eventBlocks) {
              const items = Array.from(mockData.eventBlocks.values());
              if (items.length > 0) {
                const updated = { ...items[0], ...data, updatedAt: new Date() };
                mockData.eventBlocks.set(updated.id, updated);
                return Promise.resolve([updated]);
              }
            } else if (table === schema.rsvps) {
              // For RSVPs, find and update the matching one
              const items = Array.from(mockData.rsvps.values());
              const existing = items.find((item: any) =>
                item.guestId === mockConditionContext.guestId &&
                item.eventBlockId === mockConditionContext.eventBlockId
              );
              if (existing) {
                const updated = { ...existing, ...data, updatedAt: new Date() };
                mockData.rsvps.set(updated.id, updated);
                mockConditionContext = {}; // Reset after use
                return Promise.resolve([updated]);
              }
              mockConditionContext = {}; // Reset after use
            } else if (table === schema.settings) {
              const items = Array.from(mockData.settings.values());
              if (items.length > 0) {
                const updated = { ...items[0], ...data, updatedAt: new Date() };
                mockData.settings.set(updated.key, updated);
                return Promise.resolve([updated]);
              }
            }
            return Promise.resolve([]);
          }
        })
      })
    }),
    delete: (table: any) => ({
      where: (condition: any) => {
        // Simple delete implementation
        return Promise.resolve();
      }
    })
  };

  pool = { query: () => {} };
} else {
  // Use standard PostgreSQL setup for production
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  db = drizzle({ client: pool, schema });
}

// Make mockData globally accessible for direct access in storage
if (process.env.DATABASE_URL?.startsWith('file:') && mockData) {
  (global as any).mockData = mockData;
}

export { db, pool };

// Export mock eq function for testing
export const mockEq = process.env.DATABASE_URL?.startsWith('file:') ? (global as any).mockEq : null;