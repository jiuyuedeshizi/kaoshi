import { HomePage } from "@/components/home/home-page";
import { getHomePageData } from "@/lib/site";

export default async function Page() {
  const data = await getHomePageData();

  return <HomePage {...data} />;
}
