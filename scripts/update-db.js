/* eslint-disable */
const { Schema, models, model, connect, connection } = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const ItemSchema = new Schema({
  id: String,
  name: String,
  category: String,
  tier: { type: Number, default: 8 },
  validTiers: { type: [Number], default: [] },
});
const Item = models.Item || model("Item", ItemSchema);

const SOURCE_URL =
  "https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json";

async function updateDatabase() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ HATA: MONGODB_URI bulunamadı!");
    process.exit(1);
  }

  try {
    console.log("🔌 Veritabanına bağlanılıyor...");
    await connect(process.env.MONGODB_URI);

    console.log("⏳ Veriler çekiliyor...");
    const response = await fetch(SOURCE_URL);
    const allItems = await response.json();

    const groupedItems = {};
    const tierPrefixesRegex =
      /^(Elder's|Grandmaster's|Master's|Expert's|Adept's|Journeyman's|Novice's|Beginner's)\s+/i;
    const potionPrefixesRegex =
      /^(Major|Minor|Gigantic|Powerful|Small|Medium|Large)\s+/i;

    console.log("⚙️ Veriler işleniyor ve temizleniyor...");

    allItems.forEach((item) => {
      if (!item.UniqueName || !item.LocalizedNames) return;
      const id = item.UniqueName;
      let category = null;

      // --- KATEGORİ BELİRLEME ---

      // 1. Binekler (Zırhlı Atlar vb. dahil)
      if (id.includes("_MOUNT_")) {
        if (id.includes("ARMORED_HORSE") && id.startsWith("T5"))
          category = "mount";
        else if (
          id.includes("BATTLE") ||
          id.includes("MAMMOTH") ||
          id.includes("EAGLE") ||
          id.includes("BEETLE") ||
          id.includes("BASILISK") ||
          id.includes("BALLISTA") ||
          id.includes("JUGGERNAUT") ||
          id.includes("TOWER_CHARIOT") ||
          id.includes("ENT") ||
          id.includes("GOLIATH") ||
          id.includes("RINO") ||
          id.includes("BASTION")
        )
          category = "mount";
        else if (
          (id.includes("NIGHTMARE") ||
            id.includes("RAGECLAW") ||
            id.includes("HUSKY") ||
            id.includes("TERRORBIRD") ||
            id.includes("FROSTRAM") ||
            id.includes("SWIFTCLAW") ||
            id.includes("DIREWOLF") ||
            id.includes("BEAR") ||
            id.includes("BOAR")) &&
          !id.startsWith("T3") &&
          !id.startsWith("T4")
        )
          category = "mount";
      }
      // 2. Yemek & Pot
      else if (id.includes("_MEAL")) category = "food";
      else if (id.includes("_POTION")) category = "potion";
      // 3. Zırh & Silahlar
      else if (id.includes("_HEAD_")) category = "head";
      else if (id.includes("_ARMOR_")) category = "armor";
      else if (id.includes("_SHOES_")) category = "shoes";
      else if (id.includes("_CAPE")) category = "cape";
      else if (id.includes("_MAIN_") || id.includes("_2H_"))
        category = "mainHand";
      else if (id.includes("_OFF_")) category = "offHand";

      if (!category) return;

      // --- KARA LİSTE (Bunları KESİN SİLİYORUZ) ---
      if (
        // 1. Çanta ve Toollar (İstenmeyenler)
        id.includes("_BAG") ||
        id.includes("_SATCHEL") ||
        id.includes("_TOOL_") ||
        id.includes("DEMOLITIONHAMMER") ||
        // 2. Skin ve Gereksizler
        id.includes("SKIN") ||
        id.includes("COSTUME") ||
        id.includes("VANITY") ||
        id.includes("UNLOCK") ||
        id.includes("_CAPE_") ||
        id.includes("XMAS") ||
        id.includes("LEGENDARY") ||
        id.includes("FOUNDER") ||
        id.includes("STARTERPACK") ||
        id.includes("BATRIDER") ||
        // 3. Diğer Çöpler
        id.includes("ARTIFACT") ||
        id.includes("ARTEFACT") ||
        id.includes("TOKEN") ||
        id.includes("QUEST") ||
        id.includes("TRASH") ||
        id.includes("FARM") ||
        id.includes("RECIPE") ||
        id.includes("GATHERER") ||
        id.includes("FISH") ||
        id.includes("ROYALE") ||
        id.includes("NONTRADABLE") ||
        id.includes("@") ||
        id.includes("BP") ||
        id.includes("PVP")
      )
        return;

      // --- İSİM TEMİZLEME ---
      let rawName =
        item.LocalizedNames["EN-US"] || item.LocalizedNames["EN"] || id;
      let cleanName = rawName.replace(tierPrefixesRegex, "");

      if (category === "potion") {
        cleanName = cleanName.replace(potionPrefixesRegex, "");
      }

      // Tier Bulma
      let tier = 0;
      const tierMatch = id.match(/^T(\d+)_/);
      if (tierMatch) tier = parseInt(tierMatch[1]);
      else tier = 8;

      // Gruplama
      if (!groupedItems[cleanName]) {
        groupedItems[cleanName] = {
          id: id,
          name: cleanName,
          category: category,
          tiers: new Set(),
        };
      }

      groupedItems[cleanName].tiers.add(tier);

      // Referans ID güncelleme
      const currentStoredTierMatch =
        groupedItems[cleanName].id.match(/^T(\d+)_/);
      const currentStoredTier = currentStoredTierMatch
        ? parseInt(currentStoredTierMatch[1])
        : 0;

      if (tier > currentStoredTier) {
        groupedItems[cleanName].id = id;
      }
    });

    const itemsToInsert = Object.values(groupedItems).map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      tier: 8,
      validTiers: Array.from(item.tiers).sort((a, b) => a - b),
    }));

    console.log(`🧹 Veritabanı temizleniyor...`);
    await Item.deleteMany({});

    console.log(
      `📥 ${itemsToInsert.length} adet TEMİZ item (Skin/Bag/Tool yok) kaydediliyor...`
    );
    await Item.insertMany(itemsToInsert);

    console.log("🎉 İŞLEM BAŞARILI!");
    await connection.close();
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

updateDatabase();
