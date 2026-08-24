import { db } from "@/lib/db";
import type { Role } from "@/lib/access";

export type SidebarDocument = {
  id: string;
  title: string;
  icon: string | null;
  updatedAt: Date;
  role: Role;
  ownerName: string;
  starred: boolean;
};

/** Every document a user can see (owned + shared), normalized with role + star state, newest first. */
export async function getUserDocuments(userId: string): Promise<SidebarDocument[]> {
  const [owned, shared] = await Promise.all([
    db.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        icon: true,
        updatedAt: true,
        owner: { select: { name: true } },
        stars: { where: { userId }, select: { id: true } },
      },
    }),
    db.document.findMany({
      where: { shares: { some: { userId } } },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        icon: true,
        updatedAt: true,
        owner: { select: { name: true } },
        shares: { where: { userId }, select: { permission: true } },
        stars: { where: { userId }, select: { id: true } },
      },
    }),
  ]);

  const ownedDocs: SidebarDocument[] = owned.map((d) => ({
    id: d.id,
    title: d.title,
    icon: d.icon,
    updatedAt: d.updatedAt,
    role: "owner" as const,
    ownerName: d.owner.name,
    starred: d.stars.length > 0,
  }));

  const sharedDocs: SidebarDocument[] = shared.map((d) => ({
    id: d.id,
    title: d.title,
    icon: d.icon,
    updatedAt: d.updatedAt,
    role: d.shares[0]?.permission === "EDIT" ? ("edit" as const) : ("view" as const),
    ownerName: d.owner.name,
    starred: d.stars.length > 0,
  }));

  return [...ownedDocs, ...sharedDocs].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}
