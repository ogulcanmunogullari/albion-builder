import { getItemsDirectly } from "@/services/item-service-server";
import CompositionContainer from "@/components/builder/CompositionContainer";

export default async function CreateCompositionPage() {
  // Direkt DB'den çekiyoruz, API fetch yok.
  const items = await getItemsDirectly();

  return <CompositionContainer items={items} />;
}
