import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import OjasClient from "./ojasclient";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) redirect("vault");

  return <OjasClient />;
}
