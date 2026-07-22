import HomeSettings from "../models/HomeSettings.js";

const homeSeeder = async () => {

    const exists = await HomeSettings.findOne();

    if (exists) {
        console.log("Home settings already exist.");
        return;
    }

    await HomeSettings.create({

        hero: {

            badge: "PREMIUM ELECTRONICS",

            title: "Experience Technology",

            highlight: "Without Limits.",

            description:
                "Discover premium electronics curated for creators, professionals and gamers.",

            primaryButton: "Shop Collection",

            secondaryButton: "Explore Deals"

        }

    });

    console.log("Home settings seeded.");

};

export default homeSeeder;