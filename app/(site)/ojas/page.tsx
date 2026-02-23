import { getServerSession } from "next-auth";
import { PasskeyGuard } from "@/components/PasskeyGuard"
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AskOjasPage from "./OjasClient";

export default async function OjasPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return (<PasskeyGuard><AskOjasPage user={session.user} /></PasskeyGuard>);
}
