import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserDocuments } from "@/lib/documents";
import { DashboardContent } from "@/components/DashboardContent";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const documents = await getUserDocuments(session.user.id);

  return <DashboardContent documents={documents} userName={session.user.name ?? ""} />;
}
