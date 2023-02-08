import type { StudentProfile, User } from '@prisma/client'
import { prisma } from '~/db.server'

export async function getReportsFromAthlete(athleteId: User['id']) {
    return prisma.athleteReport.findMany({
        where: {
            userId: athleteId,
        },
        select: {
            id: true,
            created_at: true,
        },
    })
}

//TODO: filter by role athlete vs staff
export async function getAthletes() {
    return prisma.user.findMany({
        select: {
            id: true,
            email: true,
            profile: true,
            status: true
        },
        orderBy: {
            profile: {
                firstName: 'asc',
            },
        },
    })
}

export async function getAthleteById(athleteId: User['id']) {
    return prisma.user.findUnique({
        where: {
            id: athleteId,
        },
        select: {
            id: true,
            email: true,
            profile: true,
            username: true,
        },
    })
}

export async function getAthleteWithReports(athleteId: User['id']) {
    return prisma.user.findUnique({
        where: {
            id: athleteId,
        },
        select: {
            id: true,
            reports: {
                select: {
                    id: true,
                    created_at: true,
                },
                orderBy: {
                    created_at: 'desc',
                },
            },
            profile: {
                select: {
                    firstName: true,
                    lastName: true,
                    grade: true,
                },
            },
        },
    })
}

export async function updateAthleteProfile(
    userId: User['id'],
    update: {
        email?: User['email']
        grade?: StudentProfile['grade'] | number
        age?: StudentProfile['age'] | number
        school?: StudentProfile['school']
    }
) {
    const { email, grade, age, school } = update

    const userWithEmail = await prisma.user.findFirst({ where: { email } })

    if (userWithEmail && userWithEmail.id !== userId) throw new Error(`User with email ${email} already exists`)

    return prisma.user.update({
        where: { id: userId },
        data: {
            email: email || undefined,
            profile: {
                update: {
                    grade: grade?.toString() || undefined,
                    age: age?.toString() || undefined,
                    school: school || undefined,
                },
            },
        },
    })
}