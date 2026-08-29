import { createCatalog } from "@/catalog/catalog";
import { mockGarments } from "@/catalog/mock-garments";
import { Feed } from "@/feed/Feed";

const catalog = createCatalog(mockGarments);

export default function Home() {
  return <Feed garments={catalog.list()} />;
}
