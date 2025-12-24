import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Comp, { ICompDoc } from "@/models/Comp";
import { getItemsDirectly } from "@/services/item-service-server";
import CompositionContainer from "@/components/builder/CompositionContainer";

async function getData(id: string) {
  try {
    await connectDB();

    // 1. .lean() ekleyerek Mongoose ağırlıklarından kurtuluyoruz.
    // Bu bize saf JavaScript objesi verir ama ObjectId'ler hala objedir.
    const compDoc = (await Comp.findById(id)
      .select("+password")
      .lean()) as ICompDoc | null;

    if (!compDoc) return null;

    const items = await getItemsDirectly();

    // 2. hasAdminPassword kontrolünü yapıyoruz
    const hasAdminPassword = !!compDoc.password && compDoc.password.length > 0;

    // 3. Şifreyi frontend'e gitmesin diye siliyoruz
    // (Typescript kızarsa diye any cast yapabiliriz veya delete kullanabiliriz)
    delete compDoc.password;

    // 4. Veri Dönüştürme (Mapping)
    const mappedComp = {
      ...compDoc,
      // DB'deki 'swap' alanını UI'daki 'eventTime'a atıyoruz (Manual Mapping)
      eventTime: compDoc.swap || "",
    };

    // 5. "NUCLEAR OPTION" ☢️
    // ObjectId({buffer...}) hatasını kesin olarak çözen satır budur.
    // Tüm objeyi string'e çevirip geri parse ederek içindeki tüm Buffer/ObjectId yapılarını string'e zorlar.
    const plainComp = JSON.parse(JSON.stringify(mappedComp));

    return {
      comp: plainComp,
      items: items,
      hasAdminPassword,
    };
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
}

export default async function SharedCompPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getData(id);

  if (!data) {
    notFound();
  }

  return (
    <CompositionContainer
      key={data.comp._id}
      items={data.items}
      initialData={data.comp}
      // Şifre varlık bilgisini prop olarak gönderiyoruz
      hasAdminPassword={data.hasAdminPassword}
    />
  );
}
