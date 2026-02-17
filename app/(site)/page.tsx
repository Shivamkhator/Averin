import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AverinClient from "./AverinClient";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) redirect("vault");

  return <AverinClient/>;
}
