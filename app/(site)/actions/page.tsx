import { getServerSession } from "next-auth";
import { PasskeyGuard } from "@/components/PasskeyGuard"
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ActionsClient from "./ActionsClient";

export default async function ActionsPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return (<PasskeyGuard><ActionsClient user={session.user} /></PasskeyGuard>);
}
