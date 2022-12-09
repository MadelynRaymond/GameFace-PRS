import type { Token, User } from '@prisma/client'
import { prisma } from '~/db.server'
import { createResetToken } from '~/mailer'

export async function createTokenForUser(email: User['email']): Promise<Token | null> {
    const existing = await prisma.token.findUnique({
        where: {
            userEmail: email,
        },
    })

    if (existing) {
        await prisma.token.delete({
            where: {
                userEmail: email,
            },
        })
    }

    const token = await createResetToken(email)

    if (!token) return null

    return prisma.token.create({
        data: {
            userEmail: email,
            token,
        },
    })
}
