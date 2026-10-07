import { prisma } from "./prisma";

export async function notifier(userId: string, message: string, lien?: string) {
  return prisma.notification.create({
    data: { userId, message, lien },
  });
}

export async function notifierPlusieurs(
  userIds: string[],
  message: string,
  lien?: string
) {
  const uniques = Array.from(new Set(userIds));
  return prisma.notification.createMany({
    data: uniques.map((userId) => ({ userId, message, lien })),
  });
}
