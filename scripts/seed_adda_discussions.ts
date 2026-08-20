import "dotenv/config";
import { db } from "../src/lib/db";

const ADDA_POSTS_DATA = [
  // 1. n:guwahati
  {
    adda: "n:guwahati",
    city: "Guwahati",
    posts: [
      {
        content: "What are your go-to rooftop cafes in Guwahati for sunset views over the Brahmaputra? Looking for good acoustic music vibe this weekend! 🌇☕",
        mediaUrls: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
      },
      {
        content: "The morning walk at Dighalipukhuri and riverfront promenade was so serene today. Guwahati winters are unbeatable! 🌿🕊️",
        mediaUrls: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80",
      },
      {
        content: "Any recommendations for traditional Assamese thali around Beltola or GS Road? Craving authentic duck curry with bamboo shoot and black sesame chicken 🍲",
        mediaUrls: null,
      },
      {
        content: "Cotton University campus is buzzing ahead of the upcoming youth festival. Exciting theatre and music line-up this year! 🎭✨",
        mediaUrls: null,
      },
      {
        content: "Sunrise cycling from Uzanbazar to Kharghuli hills. Fresh air, misty river views and hot morning laal sah from the local stall 🚴‍♀️☕",
        mediaUrls: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
      }
    ]
  },
  // 2. n:shillong
  {
    adda: "n:shillong",
    city: "Shillong",
    posts: [
      {
        content: "Fog rolling over Police Bazar and cafe hopping around Laitumkhrah. Nothing beats live indie acoustic sets in Shillong 🌧️🎸",
        mediaUrls: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1000&q=80",
      },
      {
        content: "Planning a day drive to Umiam Lake and Smit village tomorrow. Who else is driving up this Sunday? 🚗🏞️",
        mediaUrls: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
      },
      {
        content: "Local Khasi traditional snacks around Iewduh market are pure warmth. Pork momos and steaming black tea on a rainy afternoon 🥟☕",
        mediaUrls: null,
      }
    ]
  },
  // 3. n:kaziranga
  {
    adda: "n:kaziranga",
    city: "Golaghat",
    posts: [
      {
        content: "Early morning elephant safari in Central Kohora range! Spotted a mother rhino and her baby grazing right by the elephant grass. Unforgettable sight 🦏🌾",
        mediaUrls: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1000&q=80",
      },
      {
        content: "Birdwatching update from Bagori waterbodies: Huge flock of migratory bar-headed geese and spot-billed pelicans sighted this week! 🦅📷",
        mediaUrls: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1000&q=80",
      }
    ]
  },
  // 4. n:nagaland
  {
    adda: "n:nagaland",
    city: "Kohima",
    posts: [
      {
        content: "Hornbill Festival memories at Kisama heritage village! The tribal dances, log drum beats and indigenous bamboo craft displays were world-class 🦅🥁",
        mediaUrls: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
      },
      {
        content: "Sunset over Kohima War Cemetery and the surrounding pine ridges. So calm and historic 🌄✨",
        mediaUrls: null,
      }
    ]
  },
  // 5. n:sikkim
  {
    adda: "n:sikkim",
    city: "Gangtok",
    posts: [
      {
        content: "Clear blue skies today revealing the golden Kanchenjunga peak from MG Marg! Gangtok winter charm is unmatched ❄️🏔️",
        mediaUrls: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
      },
      {
        content: "Visited Rumtek Monastery this morning. The chanting, butter lamps and mountain tranquility recharge the soul 🧘‍♀️🕊️",
        mediaUrls: null,
      }
    ]
  },
  // 6. n:tawang
  {
    adda: "n:tawang",
    city: "Tawang",
    posts: [
      {
        content: "Crossing Sela Pass at 13,700 ft with frozen lake views! The prayer flags fluttering in snow breeze are breathtaking 🏔️❄️",
        mediaUrls: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1000&q=80",
      },
      {
        content: "Hot butter tea and thukpa in Tawang town after exploring the 400-year-old monastery. Incredible Arunachal warmth 🍜☕",
        mediaUrls: null,
      }
    ]
  },
  // 7. n:majuli
  {
    adda: "n:majuli",
    city: "Majuli",
    posts: [
      {
        content: "Fascinating mask-making workshop at Natun Samaguri Sattra on Majuli island. Crafted with bamboo, cow dung, clay and natural vegetable dyes 🎭🎨",
        mediaUrls: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
      },
      {
        content: "Sunset ferry crossing from Nimati Ghat to Kamalabari. The Brahmaputra river breeze and flocks of river terns are pure magic 🌅🛶",
        mediaUrls: null,
      }
    ]
  },
  // 8. n:food
  {
    adda: "n:food",
    city: "Guwahati",
    posts: [
      {
        content: "Traditional Sunday meal: Joha rice, Maasor Tenga with elephant apple (ou tenga), Khar with raw papaya, and aloo pitika with mustard oil & green chilies! 🍲🌿",
        mediaUrls: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80",
      },
      {
        content: "What is your secret ingredient when making smoked pork with fermented bamboo shoot? Let's share family recipes in this adda! 🥩🌶️",
        mediaUrls: null,
      }
    ]
  },
  // 9. n:travel
  {
    adda: "n:travel",
    city: "Shillong",
    posts: [
      {
        content: "Road trip guide: Guwahati to Cherrapunji via Shillong. Best spots for roadside tea stalls, viewpoint stops and route condition updates 🚗🗺️",
        mediaUrls: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1000&q=80",
      },
      {
        content: "Planning a 7-day backpacking circuit: Kaziranga -> Majuli -> Ziro Valley. Any homestay recommendations run by local families? 🎒🏕️",
        mediaUrls: null,
      }
    ]
  },
  // 10. n:dzukou
  {
    adda: "n:dzukou",
    city: "Kohima",
    posts: [
      {
        content: "Camped at the Dzukou valley rest house! Star-studded night sky followed by emerald rolling hills covered in morning frost. One of the best treks in India 🌸🏕️",
        mediaUrls: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
      }
    ]
  }
];

async function main() {
  console.log("🚀 Seeding authentic community posts and active discussions into Addas...");

  const allUsers = await db.user.findMany({
    select: { id: true, username: true, fullName: true, city: true, state: true },
  });

  if (allUsers.length === 0) {
    console.error("No users found in database!");
    return;
  }

  console.log(`Found ${allUsers.length} real community members in database.`);

  let postCount = 0;

  for (const group of ADDA_POSTS_DATA) {
    // Find matching users from this city/state or fallback to random users
    let matchingUsers = allUsers.filter(
      (u) => u.city?.toLowerCase() === group.city.toLowerCase() || u.state?.toLowerCase().includes(group.city.toLowerCase())
    );

    if (matchingUsers.length === 0) {
      matchingUsers = allUsers;
    }

    for (let i = 0; i < group.posts.length; i++) {
      const p = group.posts[i];
      const randomUser = matchingUsers[Math.floor(Math.random() * matchingUsers.length)];

      const hoursAgo = Math.floor(Math.random() * 72) + 1;
      const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

      await db.communityPost.create({
        data: {
          userId: randomUser.id,
          content: p.content,
          mediaUrls: p.mediaUrls,
          taggedLocation: group.adda,
          status: "Active",
          createdAt,
        },
      });
      postCount++;
    }
  }

  console.log(`✅ Successfully seeded ${postCount} authentic active discussions across Addas!`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
