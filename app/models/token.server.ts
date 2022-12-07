import type { User } from "@prisma/client";
import { prisma } from "~/db.server";
import { createResetToken } from "~/util";

export async function createTokenForUser(userId: User["id"]) {
  const existing = await prisma.token.findUnique({
    where: {userId}
  })

  if (existing) {
    await prisma.token.delete({
      where: {userId}
    })
  }

  const token = createResetToken(userId)

  return prisma.token.create({
    data: {
      userId,
      token
    }
  })
}