import type { Password, User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from '~/db.server'

export type { User } from '@prisma/client'

type Profile = {
    firstName: string
    lastName: string
    grade: string
    age: string
    school: string
}

export async function getUserById(id: User['id']) {
    return prisma.user.findUnique({ where: { id }, include: { profile: true } })
}

export async function getUserByEmail(email: User['email']) {
    return prisma.user.findUnique({ where: { email } })
}

export async function createUser({
    username,
    email,
    password,
    profile,
}: {
    username: User['username']
    email: User['email']
    password: string
    profile: Profile
}) {
    const hashedPassword = await bcrypt.hash(password, 10)
    const { grade, school, age, firstName, lastName } = profile

    return prisma.user.create({
        data: {
            username,
            email,
            password: {
                create: {
                    hash: hashedPassword,
                },
            },
            profile: {
                create: {
                    firstName,
                    lastName,
                    grade,
                    school,
                    age,
                },
            },
        },
    })
}

export async function changePassword({ userId, password }: { userId: User['id']; password: string }) {
    const hash = await bcrypt.hash(password, 10)

    return prisma.password.update({
        where: {
            userId,
        },
        data: {
            hash,
        },
    })
}

export async function deleteUserByEmail(email: User['email']) {
    return prisma.user.delete({ where: { email } })
}

export async function verifyLogin(email: User['email'], password: Password['hash']) {
    const userWithPassword = await prisma.user.findUnique({
        where: {
            email,
        },
        include: {
            password: true,
        },
    })

    if (!userWithPassword || !userWithPassword.password) {
        return null
    }

    const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

    if (!isValid) {
        return null
    }

    const { password: _password, ...userWithoutPassword } = userWithPassword

    return userWithoutPassword
}

export async function updateStatus(userId: User['id']) {
    const status = await prisma.user.findUnique({select: {status: true}, where: {id: userId}})

    const setStatus = (result: {status: string | null} | null) => {
        if (!status) return null
        return result?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    }

    return prisma.user.update({
        data: {
            status: setStatus(status) ?? 'INACTIVE'
        },
        where: {
            id: userId,
        }
    })

    
}