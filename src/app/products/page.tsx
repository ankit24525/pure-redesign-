import { redirect } from "next/navigation";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(resolvedParams)) {
    if (typeof val === "string") {
      params.set(key, val);
    } else if (Array.isArray(val) && val.length > 0) {
      params.set(key, val[0]);
    }
  }
  const queryString = params.toString();
  redirect(queryString ? `/search?${queryString}` : "/search");
}
