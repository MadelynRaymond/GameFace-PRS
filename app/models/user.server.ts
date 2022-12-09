import type { Password, User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from '~/db.server'

export type { User } from '@prisma/client'

type Profile = {
    firstName: string
    lastName: string
    grade: string
    age: string
    school: string,
}

export async function getUserById(id: User['id']) {
    return prisma.user.findUnique({ where: { id } })
}

export async function getUserByEmail(email: User['email']) {
    return prisma.user.findUnique({ where: { email } })
}

export async function createUser({username, email, password, profile}: {username: User["username"],  email: User["email"], password: string, profile: Profile}) {
    const hashedPassword = await bcrypt.hash(password, 10)
    const {grade, school, age, firstName, lastName} = profile

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
                    age
                }
            }
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
