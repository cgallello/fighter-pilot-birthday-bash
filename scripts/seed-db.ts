#!/usr/bin/env tsx

import { db } from "../server/db";
import { guests, events, rsvps } from "@shared/schema";

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Create tables if they don't exist (Drizzle will handle this automatically)
    console.log("📋 Creating tables...");

    // Insert default events
    console.log("🎯 Seeding events...");
    const eventData = [
      {
        id: 1,
        name: "Aerial Reconnaissance",
        date: "2024-12-15",
        time: "14:00",
        location: "Sky Zone Alpha",
        description: "High-altitude surveillance mission with photo opportunities",
        maxGuests: 50,
      },
      {
        id: 2,
        name: "Formation Flying",
        date: "2024-12-15",
        time: "16:30",
        location: "Flight Deck Bravo",
        description: "Synchronized flying demonstration and team coordination",
        maxGuests: 40,
      },
      {
        id: 3,
        name: "Tactical Maneuvers",
        date: "2024-12-15",
        time: "19:00",
        location: "Combat Zone Charlie",
        description: "Advanced flight patterns and defensive strategies",
        maxGuests: 30,
      },
    ];

    for (const event of eventData) {
      await db.insert(events).values(event).onConflictDoNothing();
    }

    console.log("✅ Database seeding completed successfully!");

    // Show summary
    const eventCount = await db.select().from(events);
    const guestCount = await db.select().from(guests);
    const rsvpCount = await db.select().from(rsvps);

    console.log(`📊 Database Summary:`);
    console.log(`   • Events: ${eventCount.length}`);
    console.log(`   • Guests: ${guestCount.length}`);
    console.log(`   • RSVPs: ${rsvpCount.length}`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("🚁 Database seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Database seeding failed:", error);
      process.exit(1);
    });
}

export { seedDatabase };