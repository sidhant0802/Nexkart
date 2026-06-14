// backend/seedBrandsBig.js
const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://sidhant:sidhant08@cluster0.evfoihc.mongodb.net/Nexkart?retryWrites=true&w=majority&appName=Cluster0";

// ✅ Real logos from Wikipedia/CDN — all permanent URLs
const brandsData = [
  // ───── MOBILES / ELECTRONICS ─────
  { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png", categories: ["electronics","mobiles","laptops"], tag: "Premium Tech", description: "Think Different. Premium smartphones, laptops & wearables." },
  { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/320px-Samsung_Logo.svg.png", categories: ["electronics","mobiles","home_furniture"], tag: "Mobiles & Appliances", description: "Innovation for everyone." },
  { name: "OnePlus", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/OnePlus_logo.svg/200px-OnePlus_logo.svg.png", categories: ["electronics","mobiles"], tag: "Smartphones", description: "Never Settle." },
  { name: "Xiaomi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Xiaomi_logo.svg/200px-Xiaomi_logo.svg.png", categories: ["electronics","mobiles"], tag: "Smartphones", description: "Innovation for everyone." },
  { name: "Realme", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Realme_logo.svg/320px-Realme_logo.svg.png", categories: ["electronics","mobiles"], tag: "Smartphones", description: "Dare to Leap." },
  { name: "Vivo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Vivo_Logo.svg/320px-Vivo_Logo.svg.png", categories: ["electronics","mobiles"], tag: "Smartphones", description: "Camera & Music." },
  { name: "Oppo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/OPPO_LOGO_2019.svg/320px-OPPO_LOGO_2019.svg.png", categories: ["electronics","mobiles"], tag: "Smartphones", description: "Inspiration Ahead." },
  { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/320px-Google_2015_logo.svg.png", categories: ["electronics","mobiles"], tag: "Pixel Phones", description: "Pure Android Experience." },
  { name: "Nothing", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Nothing_Logo.svg/320px-Nothing_Logo.svg.png", categories: ["electronics","mobiles"], tag: "Smartphones", description: "From Nothing comes Everything." },
  { name: "Motorola", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Motorola_logo.svg/320px-Motorola_logo.svg.png", categories: ["electronics","mobiles"], tag: "Smartphones", description: "Hello Moto." },
  { name: "Poco", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Poco_smartphone_company_logo.svg/320px-Poco_smartphone_company_logo.svg.png", categories: ["electronics","mobiles"], tag: "Smartphones", description: "Made of Mad." },
  { name: "iQOO", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/IQOO_logo.svg/320px-IQOO_logo.svg.png", categories: ["electronics","mobiles"], tag: "Gaming Phones", description: "Monster Inside." },
  { name: "Honor", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Honor_logo.svg/320px-Honor_logo.svg.png", categories: ["electronics","mobiles"], tag: "Smartphones", description: "Go Beyond." },
  { name: "Nokia", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nokia_wordmark.svg/320px-Nokia_wordmark.svg.png", categories: ["electronics","mobiles"], tag: "Phones", description: "Connecting people." },
  { name: "Huawei", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Huawei.svg/320px-Huawei.svg.png", categories: ["electronics","mobiles"], tag: "Smartphones", description: "Make it Possible." },

  // ───── LAPTOPS ─────
  { name: "Dell", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Dell_Logo.svg/200px-Dell_Logo.svg.png", categories: ["electronics","laptops"], tag: "Laptops & PCs", description: "The power to do more." },
  { name: "HP", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/200px-HP_logo_2012.svg.png", categories: ["electronics","laptops"], tag: "Laptops & Printers", description: "Keep Reinventing." },
  { name: "Asus", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/ASUS_Logo.svg/320px-ASUS_Logo.svg.png", categories: ["electronics","laptops"], tag: "Laptops", description: "In search of incredible." },
  { name: "Lenovo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Lenovo_logo_2015.svg/320px-Lenovo_logo_2015.svg.png", categories: ["electronics","laptops"], tag: "Laptops", description: "Smarter technology for all." },
  { name: "Acer", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Acer_2011.svg/320px-Acer_2011.svg.png", categories: ["electronics","laptops"], tag: "Laptops", description: "Explore Beyond Limits." },
  { name: "MSI", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Msi-Logo.svg/320px-Msi-Logo.svg.png", categories: ["electronics","laptops"], tag: "Gaming Laptops", description: "True Gaming." },
  { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/320px-Microsoft_logo_%282012%29.svg.png", categories: ["electronics","laptops"], tag: "Surface", description: "Empowering everyone." },
  { name: "Razer", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Razer_snake_logo_black.svg/200px-Razer_snake_logo_black.svg.png", categories: ["electronics","laptops"], tag: "Gaming", description: "For Gamers. By Gamers." },

  // ───── AUDIO / HEADPHONES ─────
  { name: "Sony", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/320px-Sony_logo.svg.png", categories: ["electronics","headphones_headsets"], tag: "Audio & Cameras", description: "Be Moved." },
  { name: "Bose", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Bose_logo.svg/200px-Bose_logo.svg.png", categories: ["electronics","headphones_headsets"], tag: "Premium Audio", description: "Better sound through research." },
  { name: "JBL", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/JBL_logo.svg/200px-JBL_logo.svg.png", categories: ["electronics","headphones_headsets"], tag: "Speakers & Audio", description: "Dare to listen." },
  { name: "Sennheiser", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Sennheiser_logo.svg/320px-Sennheiser_logo.svg.png", categories: ["electronics","headphones_headsets"], tag: "Audio", description: "The future of audio." },
  { name: "Boat", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Boat_logo.svg/200px-Boat_logo.svg.png", categories: ["electronics","headphones_headsets"], tag: "Audio", description: "Plug into Nirvana." },
  { name: "Beats", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Beats_Electronics_logo.svg/200px-Beats_Electronics_logo.svg.png", categories: ["electronics","headphones_headsets"], tag: "Premium Audio", description: "Hear what you want." },
  { name: "Marshall", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Marshall_logo.svg/320px-Marshall_logo.svg.png", categories: ["electronics","headphones_headsets"], tag: "Speakers", description: "Loud since 1962." },
  { name: "Skullcandy", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Skullcandy_logo.svg/320px-Skullcandy_logo.svg.png", categories: ["electronics","headphones_headsets"], tag: "Audio", description: "Feel the music." },

  // ───── SMART WATCHES ─────
  { name: "Noise", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/NoiseFit_Logo.svg/320px-NoiseFit_Logo.svg.png", categories: ["electronics","smart_watches"], tag: "Smartwatches", description: "Make Some Noise." },
  { name: "Fire-Boltt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Fire-Boltt_logo.svg/320px-Fire-Boltt_logo.svg.png", categories: ["electronics","smart_watches"], tag: "Smartwatches", description: "Fitness wearables." },
  { name: "Garmin", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Garmin_logo.svg/320px-Garmin_logo.svg.png", categories: ["electronics","smart_watches"], tag: "Premium Watches", description: "Beat Yesterday." },
  { name: "Fitbit", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Fitbit_logo16.svg/320px-Fitbit_logo16.svg.png", categories: ["electronics","smart_watches"], tag: "Fitness", description: "Find your fit." },

  // ───── HOME APPLIANCES ─────
  { name: "LG", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/LG_symbol.svg/200px-LG_symbol.svg.png", categories: ["electronics","home_furniture"], tag: "Appliances", description: "Life's Good." },
  { name: "Daikin", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Daikin_logo.svg/320px-Daikin_logo.svg.png", categories: ["home_furniture"], tag: "Air Conditioners", description: "Perfecting the Air." },
  { name: "Voltas", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Voltas_Logo.svg/320px-Voltas_Logo.svg.png", categories: ["home_furniture"], tag: "ACs", description: "India's No.1 AC." },
  { name: "Blue Star", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Blue_Star_Logo.svg/200px-Blue_Star_Logo.svg.png", categories: ["home_furniture"], tag: "ACs", description: "Built to last." },
  { name: "Whirlpool", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Whirlpool_Corporation_2017_logo.svg/320px-Whirlpool_Corporation_2017_logo.svg.png", categories: ["home_furniture"], tag: "Appliances", description: "Every day, care." },
  { name: "Bosch", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Bosch-logotype.svg/320px-Bosch-logotype.svg.png", categories: ["home_furniture"], tag: "Appliances", description: "Invented for life." },
  { name: "Philips", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Philips_logo_new.svg/320px-Philips_logo_new.svg.png", categories: ["home_furniture","electronics"], tag: "Appliances", description: "Innovation and you." },
  { name: "Panasonic", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Panasonic_logo_%28Blue%29.svg/320px-Panasonic_logo_%28Blue%29.svg.png", categories: ["electronics","home_furniture"], tag: "Electronics", description: "A Better Life, A Better World." },
  { name: "Havells", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Havells_logo.svg/320px-Havells_logo.svg.png", categories: ["home_furniture"], tag: "Appliances", description: "Hawa Badlegi." },
  { name: "Bajaj", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Bajaj_Auto_Logo.svg/320px-Bajaj_Auto_Logo.svg.png", categories: ["home_furniture"], tag: "Appliances", description: "Inspiring Trust." },
  { name: "Prestige", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/TTK_Prestige_Logo.svg/200px-TTK_Prestige_Logo.svg.png", categories: ["home_furniture"], tag: "Kitchen", description: "Cooking made easy." },

  // ───── MEN FASHION ─────
  { name: "Nike", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/200px-Logo_NIKE.svg.png", categories: ["men","men_footwear"], tag: "Sports", description: "Just Do It." },
  { name: "Adidas", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/200px-Adidas_Logo.svg.png", categories: ["men","men_footwear"], tag: "Sports", description: "Impossible is Nothing." },
  { name: "Puma", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Puma_complete_logo.svg/320px-Puma_complete_logo.svg.png", categories: ["men","men_footwear"], tag: "Sports", description: "Forever Faster." },
  { name: "Reebok", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Reebok_2019_logo.svg/200px-Reebok_2019_logo.svg.png", categories: ["men","men_footwear"], tag: "Sports", description: "Be More Human." },
  { name: "Levi's", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Levi%27s_logo.svg/200px-Levi%27s_logo.svg.png", categories: ["men","women"], tag: "Denim", description: "Quality never goes out of style." },
  { name: "Allen Solly", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Allen_Solly_logo.svg/320px-Allen_Solly_logo.svg.png", categories: ["men","men_topwear"], tag: "Formal", description: "Friday Dressing." },
  { name: "Peter England", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Peter_England_logo.png/320px-Peter_England_logo.png", categories: ["men","men_topwear"], tag: "Formal", description: "Honestly Impressive." },
  { name: "Van Heusen", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Van_Heusen_logo.svg/320px-Van_Heusen_logo.svg.png", categories: ["men","men_topwear"], tag: "Formal", description: "Style Apart." },
  { name: "Louis Philippe", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Louis_Philippe_Logo.svg/320px-Louis_Philippe_Logo.svg.png", categories: ["men","men_topwear"], tag: "Premium Formal", description: "The Upper Crest." },
  { name: "Tommy Hilfiger", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Tommy_Hilfiger_logo.svg/320px-Tommy_Hilfiger_logo.svg.png", categories: ["men","women"], tag: "Premium", description: "Classic American Cool." },
  { name: "U.S. Polo Assn.", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/U.S._Polo_Assn._logo.svg/320px-U.S._Polo_Assn._logo.svg.png", categories: ["men","men_topwear"], tag: "Casual", description: "The Sport. The Style." },
  { name: "Jack & Jones", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Jack_%26_Jones_logo.svg/320px-Jack_%26_Jones_logo.svg.png", categories: ["men","men_topwear"], tag: "Denim & Casual", description: "For the Guy." },
  { name: "Roadster", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Roadster_logo.svg/320px-Roadster_logo.svg.png", categories: ["men","men_topwear"], tag: "Casual", description: "The Spirit of the Outdoors." },
  { name: "Wrangler", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Wrangler_logo.svg/320px-Wrangler_logo.svg.png", categories: ["men"], tag: "Denim", description: "Real. Comfortable." },

  // ───── WOMEN FASHION ─────
  { name: "Zara", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/320px-Zara_Logo.svg.png", categories: ["women","men"], tag: "Fashion", description: "Latest fashion trends." },
  { name: "H&M", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/200px-H%26M-Logo.svg.png", categories: ["women","men"], tag: "Fashion", description: "Affordable fashion for all." },
  { name: "Forever 21", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Forever_21_logo.svg/320px-Forever_21_logo.svg.png", categories: ["women"], tag: "Fashion", description: "Trendy for less." },
  { name: "Vero Moda", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Vero_Moda_logo.svg/320px-Vero_Moda_logo.svg.png", categories: ["women","women_western_wear"], tag: "Western", description: "Fashion forward." },
  { name: "Only", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Only_logo.svg/200px-Only_logo.svg.png", categories: ["women","women_western_wear"], tag: "Western", description: "Denim & Casual." },
  { name: "Biba", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Biba_logo.svg/320px-Biba_logo.svg.png", categories: ["women","women_sarees"], tag: "Ethnic", description: "Be You. Be Beautiful." },
  { name: "W for Women", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/W_for_Woman_logo.svg/200px-W_for_Woman_logo.svg.png", categories: ["women","women_sarees"], tag: "Ethnic", description: "Where Fashion Meets Comfort." },
  { name: "Global Desi", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Global_Desi_logo.svg/320px-Global_Desi_logo.svg.png", categories: ["women","women_sarees"], tag: "Ethnic", description: "Boho Chic." },
  { name: "Aurelia", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Aurelia_logo.svg/200px-Aurelia_logo.svg.png", categories: ["women","women_sarees"], tag: "Ethnic", description: "Indian Wear." },
  { name: "FabIndia", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Fabindia_logo.svg/320px-Fabindia_logo.svg.png", categories: ["women","men","women_sarees"], tag: "Ethnic", description: "Celebrate India." },
  { name: "Mango", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Mango_logo.svg/200px-Mango_logo.svg.png", categories: ["women"], tag: "Fashion", description: "Dressing the modern woman." },
  { name: "Chemistry", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Chemistry_logo.svg/320px-Chemistry_logo.svg.png", categories: ["women","women_western_wear"], tag: "Western", description: "Express Yourself." },
  { name: "Anouk", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Anouk_logo.svg/320px-Anouk_logo.svg.png", categories: ["women","women_sarees"], tag: "Ethnic", description: "Effortless Ethnic." },
  { name: "Libas", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Libas_logo.svg/320px-Libas_logo.svg.png", categories: ["women","women_sarees"], tag: "Ethnic", description: "Indian elegance." },

  // ───── FOOTWEAR ─────
  { name: "Bata", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Bata_Shoes_logo.svg/200px-Bata_Shoes_logo.svg.png", categories: ["men","men_footwear","women"], tag: "Footwear", description: "Make a Statement." },
  { name: "Woodland", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Woodland_logo.svg/200px-Woodland_logo.svg.png", categories: ["men","men_footwear"], tag: "Outdoor", description: "Nature's Gear." },
  { name: "Skechers", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Skechers_logo.svg/320px-Skechers_logo.svg.png", categories: ["men","men_footwear","women"], tag: "Comfort", description: "The Comfort Technology Company." },
  { name: "Crocs", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Crocs_logo.svg/200px-Crocs_logo.svg.png", categories: ["men","women","men_footwear"], tag: "Casual", description: "Come As You Are." },
  { name: "Hush Puppies", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Hush_Puppies_logo.svg/320px-Hush_Puppies_logo.svg.png", categories: ["men","men_footwear"], tag: "Formal", description: "Casual Comfort." },
  { name: "Red Tape", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Red_Tape_logo.svg/200px-Red_Tape_logo.svg.png", categories: ["men","men_footwear"], tag: "Footwear", description: "Walk the Talk." },
  { name: "Liberty", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Liberty_Shoes_logo.svg/200px-Liberty_Shoes_logo.svg.png", categories: ["men","men_footwear"], tag: "Footwear", description: "Step ahead." },
  { name: "Campus", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Campus_logo.svg/320px-Campus_logo.svg.png", categories: ["men","men_footwear"], tag: "Sports", description: "Run with passion." },
  { name: "Sparx", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Sparx_logo.svg/320px-Sparx_logo.svg.png", categories: ["men","men_footwear"], tag: "Sports", description: "Sport Spirit." },

  // ───── FURNITURE ─────
  { name: "IKEA", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ikea_logo.svg/200px-Ikea_logo.svg.png", categories: ["home_furniture"], tag: "Furniture", description: "Better Everyday Life." },
  { name: "Urban Ladder", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Urban_Ladder_Logo.png/320px-Urban_Ladder_Logo.png", categories: ["home_furniture"], tag: "Furniture", description: "Let's Create." },
  { name: "Pepperfry", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Pepperfry_logo.png/320px-Pepperfry_logo.png", categories: ["home_furniture"], tag: "Furniture", description: "Happy Furniture to You." },
  { name: "Godrej Interio", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Godrej_Logo.svg/200px-Godrej_Logo.svg.png", categories: ["home_furniture"], tag: "Furniture", description: "Brighter Living." },
  { name: "Nilkamal", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Nilkamal_logo.svg/200px-Nilkamal_logo.svg.png", categories: ["home_furniture"], tag: "Furniture", description: "Trusted by India." },
  { name: "Wakefit", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Wakefit_logo.svg/320px-Wakefit_logo.svg.png", categories: ["home_furniture"], tag: "Mattresses", description: "Sleep Well." },
  { name: "Sleepwell", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Sleepwell_logo.svg/200px-Sleepwell_logo.svg.png", categories: ["home_furniture"], tag: "Mattresses", description: "India Sleeps on Sleepwell." },
  { name: "Duroflex", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Duroflex_logo.svg/200px-Duroflex_logo.svg.png", categories: ["home_furniture"], tag: "Mattresses", description: "Sleep Right." },
  { name: "Wooden Street", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Wooden_Street_logo.svg/320px-Wooden_Street_logo.svg.png", categories: ["home_furniture"], tag: "Furniture", description: "Customize Your Furniture." },
];

async function seedBrands() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!");

    const Brand = require("./src/models/Brand");

    console.log("\n🗑️  Clearing existing brands...");
    await Brand.deleteMany({});

    console.log(`\n📦 Seeding ${brandsData.length} brands...`);
    let count = 0;
    for (const b of brandsData) {
      const slug = b.name.toLowerCase().trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      await new Brand({
        name: b.name,
        slug,
        logo: b.logo,
        description: b.description,
        tagline: b.tag,
        categories: b.categories,
        featured: true,
        isActive: true,
      }).save();
      console.log(`  ✅ ${(++count).toString().padStart(3)}. ${b.name.padEnd(20)} | ${b.categories.join(", ")}`);
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🎉 ${count} brands seeded successfully!`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error("❌", e.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedBrands();