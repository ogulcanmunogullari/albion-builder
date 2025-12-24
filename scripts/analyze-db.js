/* eslint-disable */
const { Schema, models, model, connect, connection } = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

async function analyze() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI yok!");
    process.exit(1);
  }

  try {
    await connect(process.env.MONGODB_URI);
    console.log("🔍 Veritabanı Analiz Ediliyor...\n");

    const ItemModel =
      models.Item ||
      model(
        "Item",
        new Schema({
          category: String,
          subCategory: String,
          name: String,
          tier: Number,
          validTiers: [Number],
        })
      );

    // 1. Toplam Item Sayısı
    const total = await ItemModel.countDocuments();
    console.log(`📦 Toplam Item Sayısı: ${total}`);

    // 2. Kategori Dağılımı
    const categories = await ItemModel.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    console.log("\n📊 Kategori Dağılımı:");
    categories.forEach((c) => console.log(`   - ${c._id}: ${c.count}`));

    // 3. "Other" SubCategory Olanlar (Potansiyel Çöpler)
    const others = await ItemModel.find({ subCategory: "Other" }).limit(20);
    const otherCount = await ItemModel.countDocuments({ subCategory: "Other" });

    console.log(
      `\n🗑️  'Other' Alt Kategorisindeki Itemlar (${otherCount} adet):`
    );
    console.log(
      "   (Bunlar muhtemelen kullanmadığımız veya yanlış sınıflandırılanlar)"
    );
    others.forEach((i) => console.log(`   - [${i.category}] ${i.name}`));

    // 4. Tier 4 Altındaki Itemlar (ZvZ'de genelde kullanılmaz)
    // validTiers dizisi boş olan veya en yüksek tier'ı 4'ten küçük olanlar
    const lowTiers = await ItemModel.find({
      $or: [
        { validTiers: { $exists: true, $eq: [] } },
        // Sadece max tier'ı 3 ve altı olanları bulmak biraz daha karmaşık sorgu gerektirir
        // ama şimdilik validTiers boş olanlara bakalım
      ],
    }).limit(10);

    const emptyTiersCount = await ItemModel.countDocuments({
      validTiers: { $exists: true, $eq: [] },
    });
    console.log(
      `\n⚠️  Hiçbir Tier'ı Olmayan (ValidTiers Empty) Itemlar (${emptyTiersCount} adet):`
    );
    lowTiers.forEach((i) => console.log(`   - ${i.name} (${i.category})`));

    await connection.close();
  } catch (error) {
    console.error(error);
  }
}

analyze();
