import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
    const email = 'rachel@remix.run'

    const hashedPassword = await bcrypt.hash('racheliscool', 10)

    // cleanup the existing database
    await prisma.user
        .delete({
            where: { email },
        })
        .catch(() => {
            // no worries if it doesn't exist yet
        })

    const user = await prisma.user.create({
        data: {
            email,
            password: {
                create: {
                    hash: hashedPassword,
                },
            },
            profile: {
                create: {
                    grade: '9',
                    firstName: 'Rachel',
                    lastName: 'Wilson',
                },
            },
        },
    })

    const shooting = await prisma.exerciseCategory.create({
        data: {
            name: 'Shooting',
        },
    })

    const dribbling = await prisma.exerciseCategory.create({
        data: {
            name: 'Dribbling',
        },
    })

    const freeThrowDrill = await prisma.drill.create({
        data: {
            name: 'Free Throws',
            category: {
                connect: {
                    id: shooting.id,
                },
            },
        },
    })

    const dribblingSpeed = await prisma.drill.create({
        data: {
            name: 'Dribbling Speed',
            category: {
                connect: {
                    id: dribbling.id,
                },
            },
        },
    })

    const report = await prisma.athleteReport.create({
        data: {
            user: {
                connect: {
                    id: user.id,
                },
            },
        },
    })
    const report_two = await prisma.athleteReport.create({
        data: {
            user: {
                connect: {
                    id: user.id,
                },
            },
        },
    })

    const report_three = await prisma.athleteReport.create({
        data: {
            user: {
                connect: {
                    id: user.id,
                },
            },
        },
    })

    //shooting entries

    await prisma.drillEntry.createMany({
        data: [
            {
                drillId: freeThrowDrill.id,
                value: 35,
                outOf: 50,
                userId: user.id,
                reportId: report.id,
                unit: 'integral',
            },
            {
                drillId: freeThrowDrill.id,
                value: 37,
                outOf: 50,
                userId: user.id,
                reportId: report_two.id,
                unit: 'integral',
            },
            {
                drillId: freeThrowDrill.id,
                value: 46,
                outOf: 50,
                userId: user.id,
                reportId: report_three.id,
                unit: 'integral',
            },
        ],
    })

    //dribbling entries

    await prisma.drillEntry.createMany({
        data: [
            {
                drillId: dribblingSpeed.id,
                value: 75,
                bestScore: 55,
                userId: user.id,
                reportId: report.id,
                unit: 'time',
            },
            {
                drillId: dribblingSpeed.id,
                value: 80,
                bestScore: 45,
                userId: user.id,
                reportId: report_two.id,
                unit: 'time',
            },
            {
                drillId: dribblingSpeed.id,
                value: 60,
                bestScore: 39,
                userId: user.id,
                reportId: report_three.id,
                unit: 'time',
            },
        ],
    })

    console.log(`Database has been seeded. 🌱`)
}

seed()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
