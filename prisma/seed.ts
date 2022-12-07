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

    await prisma.drillEntry.create({
        data: {
            drill: {
                connect: {
                    id: freeThrowDrill.id,
                },
            },
            report: {
                connect: {
                    id: report.id,
                },
            },
            user: {
                connect: {
                    id: user.id,
                },
            },
            score: {
                create: {
                    value: 25,
                    outOf: 50,
                    unit: 'Shots made',
                },
            },
        },
    })

    await prisma.drillEntry.create({
        data: {
            drill: {
                connect: {
                    id: freeThrowDrill.id,
                },
            },
            report: {
                connect: {
                    id: report_two.id,
                },
            },
            user: {
                connect: {
                    id: user.id,
                },
            },
            score: {
                create: {
                    value: 35,
                    outOf: 50,
                    unit: 'Shots made',
                },
            },
        },
    })

    await prisma.drillEntry.create({
        data: {
            drill: {
                connect: {
                    id: freeThrowDrill.id,
                },
            },
            report: {
                connect: {
                    id: report_three.id,
                },
            },
            user: {
                connect: {
                    id: user.id,
                },
            },
            score: {
                create: {
                    value: 48,
                    outOf: 50,
                    unit: 'Shots made',
                },
            },
        },
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
