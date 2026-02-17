import { getServerSession } from "next-auth";
import { PasskeyGuard } from "@/components/PasskeyGuard"
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AskAverinPage from "./AverinClient";

export default async function AverinPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return (<PasskeyGuard><AskAverinPage user={session.user} /></PasskeyGuard>);
}
