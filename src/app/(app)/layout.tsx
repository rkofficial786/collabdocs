import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserDocuments } from "@/lib/documents";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const documents = await getUserDocuments(session.user.id);

  return (
    <AppShell user={{ name: session.user.name ?? "", email: session.user.email ?? "" }} documents={documents}>
      {children}
    </AppShell>
  );
}
