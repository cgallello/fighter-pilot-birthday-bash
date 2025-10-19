import { db } from "./db";
import { settings, eventBlocks } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Seed settings
    await db.insert(settings).values([
      {
        key: "EVENT_TITLE",
        value: "OPERATION: THIRTY-FIVE",
      },
      {
        key: "EVENT_DESCRIPTION",
        value:
          "Mission Briefing: You are cleared for the ultimate birthday celebration. Confirm your deployment slot and prepare for tactical fun at 35,000 feet of awesome!",
      },
    ]).onConflictDoNothing();

    console.log("✅ Settings seeded");

    // Seed fair weather events
    await db.insert(eventBlocks).values([
      {
        title: "Pre-Flight Briefing",
        description:
          "Mission objectives and safety protocols. All pilots must attend this crucial briefing before deployment.",
        startTime: new Date("2025-03-15T14:00:00"),
        endTime: new Date("2025-03-15T15:00:00"),
        location: "Command Center, 123 Squadron Ave",
        planType: "FAIR",
        sortOrder: 1,
      },
      {
        title: "Outdoor Flight Exercises",
        description:
          "Tactical maneuvers and formation flying in perfect weather conditions. Experience real fighter jet thrills!",
        startTime: new Date("2025-03-15T15:30:00"),
        endTime: new Date("2025-03-15T17:00:00"),
        location: "Airfield Training Ground, Runway 7",
        planType: "FAIR",
        sortOrder: 2,
      },
      {
        title: "Victory Celebration",
        description:
          "Cake cutting ceremony and awards for outstanding pilots! Celebrate a successful mission outdoors.",
        startTime: new Date("2025-03-15T17:30:00"),
        endTime: new Date("2025-03-15T19:00:00"),
        location: "Officers' Club Patio, Building 35",
        planType: "FAIR",
        sortOrder: 3,
      },
    ]).onConflictDoNothing();

    console.log("✅ Fair weather events seeded");

    // Seed rain plan events
    await db.insert(eventBlocks).values([
      {
        title: "Indoor Simulator Training",
        description:
          "State-of-the-art flight simulation with weather effects and tactical scenarios. Just as exciting as the real thing!",
        startTime: new Date("2025-03-15T14:00:00"),
        endTime: new Date("2025-03-15T16:00:00"),
        location: "Hangar 5, Simulator Bay",
        planType: "RAIN",
        sortOrder: 1,
      },
      {
        title: "Strategic Planning Workshop",
        description:
          "Learn advanced mission planning techniques from our best commanders. Interactive and educational!",
        startTime: new Date("2025-03-15T16:30:00"),
        endTime: new Date("2025-03-15T17:30:00"),
        location: "Conference Room Alpha, HQ Building",
        planType: "RAIN",
        sortOrder: 2,
      },
      {
        title: "Victory Celebration (Indoor)",
        description:
          "Cake cutting ceremony and awards in our climate-controlled hangar! All the fun, none of the rain.",
        startTime: new Date("2025-03-15T18:00:00"),
        endTime: new Date("2025-03-15T19:30:00"),
        location: "Hangar 35, Main Floor",
        planType: "RAIN",
        sortOrder: 3,
      },
    ]).onConflictDoNothing();

    console.log("✅ Rain plan events seeded");

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📝 Remember to set your ADMIN_PASSWORD environment secret!");
    console.log("   Example: export ADMIN_PASSWORD=your-secure-password");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
