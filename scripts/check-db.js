/* eslint-disable */
const { Schema, models, model, connect, connection } = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

async function checkItem() {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI yok!");
    process.exit(1);
  }

  try {
    await connect(process.env.MONGODB_URI);

    // Test için bir Kılıç arayalım (Broadsword)
    const item = await (
      models.Item ||
      model("Item", new Schema({ name: String, subCategory: String }))
    ).findOne({ name: { $regex: "Broadsword", $options: "i" } });

    console.log("--- DB KONTROL SONUCU ---");
    if (item) {
      console.log(`İsim: ${item.name}`);
      console.log(`SubCategory: ${item.subCategory}`); // BURASI ÖNEMLİ
      console.log(
        `(Eğer üstteki satır 'undefined' ise DB'ye yazılmamış demektir)`
      );
    } else {
      console.log("Item bulunamadı.");
    }

    await connection.close();
  } catch (error) {
    console.error(error);
  }
}

checkItem();
