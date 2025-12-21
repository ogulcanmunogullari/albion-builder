/* eslint-disable */
const { Schema, models, model, connect, connection, set } = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

// Mongoose debug modunu kapatarak terminal kirliliğini engelliyoruz
set("debug", false);

const ItemSchema = new Schema({
  id: String,
  name: String,
  category: String,
  subCategory: String,
  tier: { type: Number, default: 8 },
  validTiers: { type: [Number], default: [] },
  maxEnchantment: { type: Number, default: 0 },
  minEnchantment: { type: Number, default: 0 },
});
const Item = models.Item || model("Item", ItemSchema);

const SOURCE_URL =
  "https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json";

function determineSubCategory(id, category) {
  if (category === "mount") return "Mounts";
  if (category === "potion") return "Potions";
  if (category === "food") return "Food";
  const idUpper = id.toUpperCase();
  if (
    idUpper.includes("DOUBLEBLADEDSTAFF") ||
    idUpper.includes("TWINSCYTHE") ||
    idUpper.includes("ROCKSTAFF") ||
    idUpper.includes("COMBATSTAFF")
  )
    return "Quarterstaff";
  if (idUpper.includes("FIRE_RINGPAIR") || idUpper.includes("INFERNOSTAFF"))
    return "Fire Staff";
  if (idUpper.includes("DEMONSKULL") || idUpper.includes("TOME_CRYSTAL"))
    return "Book";
  if (idUpper.includes("SCYTHE_HELL") || idUpper.includes("SCYTHE_CRYSTAL"))
    return "Axe";
  if (idUpper.includes("RAPIER") || idUpper.includes("DUALSICKLE"))
    return "Dagger";
  if (idUpper.includes("SKULLORB") || idUpper.includes("DEMONICSTAFF"))
    return "Cursed Staff";
  if (
    idUpper.includes("ENIGMATICORB") ||
    idUpper.includes("ENIGMATICSTAFF") ||
    idUpper.includes("ARCANE_RINGPAIR")
  )
    return "Arcane Staff";
  if (idUpper.includes("FLAIL")) return "Mace";
  if (
    idUpper.includes("GLACIALSTAFF") ||
    idUpper.includes("ICEGAUNTLETS") ||
    idUpper.includes("ICECRYSTAL")
  )
    return "Frost Staff";
  if (idUpper.includes("DIVINESTAFF")) return "Holy Staff";
  if (idUpper.includes("WILDSTAFF")) return "Nature Staff";
  if (idUpper.includes("HARPOON") || idUpper.includes("TRIDENT"))
    return "Spear";
  if (
    idUpper.includes("SCIMITAR") ||
    idUpper.includes("CLEAVER") ||
    idUpper.includes("DUALSCIMITAR")
  )
    return "Sword";
  if (idUpper.includes("RAM_KEEPER")) return "Hammer";
  if (
    idUpper.includes("JESTERCANE") ||
    idUpper.includes("LAMP") ||
    idUpper.includes("TALISMAN")
  )
    return "Torch";
  if (category === "armor" || category === "head" || category === "shoes") {
    if (idUpper.includes("PLATE")) return "Plate";
    if (idUpper.includes("LEATHER")) return "Leather";
    if (idUpper.includes("CLOTH")) return "Cloth";
    return "Gathering/Other";
  }
  if (category === "mainHand" || category === "offHand") {
    if (
      idUpper.includes("SWORD") ||
      idUpper.includes("CLAYMORE") ||
      idUpper.includes("GALATINE") ||
      idUpper.includes("BLADE") ||
      idUpper.includes("KINGMAKER")
    )
      return "Sword";
    if (
      idUpper.includes("AXE") ||
      idUpper.includes("HALBERD") ||
      idUpper.includes("BILLHOOK") ||
      idUpper.includes("CARRION") ||
      idUpper.includes("BATTLEAXE") ||
      idUpper.includes("SCYTHE")
    )
      return "Axe";
    if (
      idUpper.includes("MACE") ||
      idUpper.includes("MORNINGSTAR") ||
      idUpper.includes("BEDROCK") ||
      idUpper.includes("INCUBUS") ||
      idUpper.includes("CAMLANN")
    )
      return "Mace";
    if (
      idUpper.includes("HAMMER") ||
      idUpper.includes("MAUL") ||
      idUpper.includes("FORGEHAMMER")
    )
      return "Hammer";
    if (
      idUpper.includes("CROSSBOW") ||
      idUpper.includes("REPEATER") ||
      idUpper.includes("BOLTCASTER") ||
      idUpper.includes("ARBALEST") ||
      idUpper.includes("SIEGEBOW")
    )
      return "Crossbow";
    if (
      idUpper.includes("SHIELD") ||
      idUpper.includes("AEGIS") ||
      idUpper.includes("SARCOPHAGUS") ||
      idUpper.includes("CAITIFF") ||
      idUpper.includes("FACEBREAKER")
    )
      return "Shield";
    if (
      idUpper.includes("WARGLOVES") ||
      idUpper.includes("KNUCKLES") ||
      idUpper.includes("CESTUS") ||
      idUpper.includes("FISTS") ||
      idUpper.includes("BRAWLER")
    )
      return "War Gloves";
    if (
      idUpper.includes("BOW") ||
      idUpper.includes("LONGBOW") ||
      idUpper.includes("WARBOW") ||
      idUpper.includes("WAILING") ||
      idUpper.includes("MISTPIERCER")
    )
      return "Bow";
    if (
      idUpper.includes("SPEAR") ||
      idUpper.includes("PIKE") ||
      idUpper.includes("GLAIVE") ||
      idUpper.includes("LANCE") ||
      idUpper.includes("DAYBREAKER")
    )
      return "Spear";
    if (
      idUpper.includes("NATURE") ||
      idUpper.includes("BLIGHT") ||
      idUpper.includes("DRUIDIC")
    )
      return "Nature Staff";
    if (
      idUpper.includes("DAGGER") ||
      idUpper.includes("PAIR") ||
      idUpper.includes("CLAW")
    )
      return "Dagger";
    if (
      idUpper.includes("QUARTERSTAFF") ||
      idUpper.includes("IRONCLAD") ||
      idUpper.includes("DOUBLE")
    )
      return "Quarterstaff";
    if (
      idUpper.includes("TORCH") ||
      idUpper.includes("HORN") ||
      idUpper.includes("CANDLE") ||
      idUpper.includes("CALLER")
    )
      return "Torch";
    if (
      idUpper.includes("FIRE") ||
      idUpper.includes("WILDFIRE") ||
      idUpper.includes("BRIMSTONE") ||
      idUpper.includes("DAWNSONG") ||
      idUpper.includes("METEOR")
    )
      return "Fire Staff";
    if (
      idUpper.includes("HOLY") ||
      idUpper.includes("LIFETOUCH") ||
      idUpper.includes("FALLEN") ||
      idUpper.includes("HALLOWFALL")
    )
      return "Holy Staff";
    if (
      idUpper.includes("ARCANE") ||
      idUpper.includes("WITCHWORK") ||
      idUpper.includes("OCCULT")
    )
      return "Arcane Staff";
    if (
      idUpper.includes("FROST") ||
      idUpper.includes("HOARFROST") ||
      idUpper.includes("CHILLHOWL") ||
      idUpper.includes("PERMAFROST")
    )
      return "Frost Staff";
    if (
      idUpper.includes("CURSED") ||
      idUpper.includes("CURSE") ||
      idUpper.includes("DAMNATION") ||
      idUpper.includes("SHADOWCALLER")
    )
      return "Cursed Staff";
    if (
      idUpper.includes("SHAPESHIFTER") ||
      idUpper.includes("PROWLING") ||
      idUpper.includes("PRIMAL") ||
      idUpper.includes("BLOODMOON")
    )
      return "Shapeshifter";
    if (
      idUpper.includes("BOOK") ||
      idUpper.includes("ORB") ||
      idUpper.includes("TOTEM") ||
      idUpper.includes("CENSER") ||
      idUpper.includes("TOME") ||
      idUpper.includes("GRIMOIRE")
    )
      return "Book";
  }
  if (category === "cape") {
    if (id.includes("BP_")) return "Faction Capes";
    return "Regular Capes";
  }
  return "Other";
}

async function updateDatabase() {
  if (!process.env.MONGODB_URI)
    return console.error("❌ HATA: MONGODB_URI bulunamadı!");

  try {
    await connect(process.env.MONGODB_URI);
    process.stdout.write("⏳ Veriler çekiliyor ve işleniyor...");

    const response = await fetch(SOURCE_URL);
    const allItems = await response.json();

    const groupedItems = {};
    const tierPrefixesRegex =
      /^(Elder's|Grandmaster's|Master's|Expert's|Adept's|Journeyman's|Novice's|Beginner's)\s+/i;
    const potionPrefixesRegex =
      /^(Major|Minor|Gigantic|Powerful|Small|Medium|Large)\s+/i;

    const FORCED_EQUIPMENT_CATS = [
      "mainHand",
      "offHand",
      "head",
      "armor",
      "shoes",
      "cape",
    ];
    const BANNED_NAMES = [
      "The Hand of Khor",
      "Rosalia's Diary",
      "Vendetta's Wrath",
      "Black Hands",
      "Arcane Essence",
    ];

    allItems.forEach((item) => {
      if (!item.UniqueName || !item.LocalizedNames) return;
      const id = item.UniqueName;
      let category = null;

      if (id.includes("_MOUNT_") || id.startsWith("UNIQUE_MOUNT_"))
        category = "mount";
      else if (id.includes("_MEAL")) category = "food";
      else if (id.includes("_POTION")) category = "potion";
      else if (id.includes("_HEAD_") || id.includes("_HELMET_"))
        category = "head";
      else if (id.includes("_ARMOR_")) category = "armor";
      else if (id.includes("_SHOES_") || id.includes("_BOOTS_"))
        category = "shoes";
      else if (id.includes("_CAPE")) category = "cape";
      else if (id.includes("_OFF_") || id.includes("_SHIELD_"))
        category = "offHand";
      else if (
        (id.includes("_MAIN_") || id.includes("_2H_")) &&
        category !== "mount"
      )
        category = "mainHand";

      if (!category) return;

      let rawName =
        item.LocalizedNames["EN-US"] || item.LocalizedNames["EN"] || id;
      let cleanName = rawName.replace(tierPrefixesRegex, "").trim();
      if (category === "potion")
        cleanName = cleanName.replace(potionPrefixesRegex, "").trim();
      if (BANNED_NAMES.includes(cleanName)) return;

      if (
        id.includes("ARTEFACT") ||
        id.includes("ARTIFACT") ||
        id.includes("FRAGMENT") ||
        id.includes("TOKEN") ||
        id.includes("QUEST") ||
        id.includes("BP") ||
        id.includes("DEBUG") ||
        id.includes("_BAG") ||
        id.includes("_SATCHEL") ||
        id.includes("_GATHERER") ||
        id.includes("_STARTERPACK") ||
        id.includes("_GAMEMASTER") ||
        id.includes("_FOUNDER") ||
        id.includes("_TOOL_") ||
        id.includes("_BATRIDER") ||
        id.includes("_RUBBERBANDING") ||
        id.includes("_CAPE_") ||
        id.includes("DEMOLITIONHAMMER") ||
        (id.includes("SKIN") && !id.includes("STONESKIN")) ||
        id.includes("VANITY") ||
        id.includes("UNLOCK") ||
        id.includes("XMAS")
      )
        return;

      if (!groupedItems[cleanName]) {
        groupedItems[cleanName] = {
          id,
          name: cleanName,
          category,
          subCategory: determineSubCategory(id, category),
          tiers: new Set(),
          maxEnchantment: 0,
          minEnchantment: 100,
          maxTier: 0,
        };
      }

      let tier = parseInt(id.match(/^T(\d+)_/)?.[1] || "8");
      let enchantment = parseInt(id.match(/@(\d+)$/)?.[1] || "0");

      const g = groupedItems[cleanName];
      g.tiers.add(tier);
      if (enchantment > g.maxEnchantment) g.maxEnchantment = enchantment;
      if (enchantment < g.minEnchantment) g.minEnchantment = enchantment;
      if (tier > g.maxTier) {
        g.id = id;
        g.maxTier = tier;
      }
    });

    const itemsToInsert = Object.values(groupedItems).map((i) => {
      let finalValidTiers = Array.from(i.tiers).sort((a, b) => a - b);
      const isEquip = FORCED_EQUIPMENT_CATS.includes(i.category);
      if (isEquip) finalValidTiers = [4, 5, 6, 7, 8];

      return {
        id: i.id,
        name: i.name,
        category: i.category,
        subCategory: i.subCategory || "Other",
        tier: 8,
        validTiers: finalValidTiers,
        maxEnchantment: isEquip
          ? 4
          : ["food", "potion"].includes(i.category)
          ? 3
          : 0,
        minEnchantment: i.minEnchantment === 100 ? 0 : i.minEnchantment,
      };
    });

    await Item.deleteMany({});

    // İşlemi ordered:false yaparak arka plan loglarını susturuyoruz
    await Item.insertMany(itemsToInsert, { ordered: false });

    process.stdout.write(
      "\n✅ Başarılı! Toplam " + itemsToInsert.length + " item yüklendi.\n"
    );

    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Hata:", error.message);
    if (connection) await connection.close();
    process.exit(1);
  }
}

updateDatabase();
