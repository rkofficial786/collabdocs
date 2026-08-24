import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const SEED_PASSWORD = "password123";

const welcomeDoc = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Welcome to CollabDocs" }] },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "This is a " },
        { type: "text", marks: [{ type: "bold" }], text: "sample document" },
        { type: "text", text: " owned by Alice and shared with Bob so you can see " },
        { type: "text", marks: [{ type: "italic" }], text: "sharing" },
        { type: "text", text: " in action." },
      ],
    },
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "What you can try" }] },
    {
      type: "bulletList",
      content: [
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Edit this text with the toolbar above" }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Rename the document from the title field" }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Import a .txt, .md, or .docx file from the dashboard" }] }] },
      ],
    },
  ],
};

const draftDoc = {
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Q3 Planning Notes" }] },
    { type: "paragraph", content: [{ type: "text", text: "Bob's private draft. Alice cannot see this one." }] },
    {
      type: "orderedList",
      content: [
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Finalize roadmap" }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Review budget" }] }] },
      ],
    },
  ],
};

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const [alice, bob, carol] = await Promise.all(
    [
      { name: "Alice Chen", email: "alice@demo.com" },
      { name: "Bob Martinez", email: "bob@demo.com" },
      { name: "Carol Nguyen", email: "carol@demo.com" },
    ].map((u) =>
      db.user.upsert({
        where: { email: u.email },
        update: {},
        create: { ...u, passwordHash },
      })
    )
  );

  const welcome = await db.document.upsert({
    where: { id: "seed-welcome-doc" },
    update: { title: "Welcome to CollabDocs", content: welcomeDoc },
    create: {
      id: "seed-welcome-doc",
      title: "Welcome to CollabDocs",
      content: welcomeDoc,
      ownerId: alice.id,
    },
  });

  await db.documentShare.upsert({
    where: { documentId_userId: { documentId: welcome.id, userId: bob.id } },
    update: {},
    create: { documentId: welcome.id, userId: bob.id, permission: "EDIT" },
  });

  await db.documentShare.upsert({
    where: { documentId_userId: { documentId: welcome.id, userId: carol.id } },
    update: {},
    create: { documentId: welcome.id, userId: carol.id, permission: "VIEW" },
  });

  await db.document.upsert({
    where: { id: "seed-draft-doc" },
    update: { title: "Q3 Planning Notes", content: draftDoc },
    create: {
      id: "seed-draft-doc",
      title: "Q3 Planning Notes",
      content: draftDoc,
      ownerId: bob.id,
    },
  });

  console.log("Seeded users (password for all: %s):", SEED_PASSWORD);
  console.log("  alice@demo.com / owns 'Welcome to CollabDocs', shared with bob (edit) & carol (view)");
  console.log("  bob@demo.com   / owns 'Q3 Planning Notes', has edit access to Alice's doc");
  console.log("  carol@demo.com / has view-only access to Alice's doc");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
