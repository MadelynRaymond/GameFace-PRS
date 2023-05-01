import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {


    //category: Speed, Dribbling, etc.
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

    const speed = await prisma.exerciseCategory.create({
        data: {
            name: 'Speed',
        },
    })

    const passing = await prisma.exerciseCategory.create({
        data: {
            name: 'Passing',
        },
    })

    const strength = await prisma.exerciseCategory.create({
        data: {
            name: 'Strength',
        },
    })

    const jumping = await prisma.exerciseCategory.create({
        data: {
            name: 'Jumping',
        },
    })

    //step two: add drill

    const freeThrowDrill = await prisma.drill.create({
        data: {
            name: 'Free Throws',
            category: {
                connect: {
                    id: shooting.id,
                },
            },
            drillUnit: 'integral',
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
            drillUnit: 'time',
        },
    })

    const squatDrill = await prisma.drill.create({
        data: {
            name: 'Squat Drill',
            category: {
                connect: {
                    id: strength.id,
                },
            },
            drillUnit: 'time',
        },
    })

    const jumpDistanceDrill = await prisma.drill.create({
        data: {
            name: 'Jump Distance Drill',
            category: {
                connect: {
                    id: strength.id,
                },
            },
            drillUnit: 'decimal',
        },
    })

    const speedDrill = await prisma.drill.create({
        data: {
            name: 'Speed Drill',
            category: {
                connect: {
                    id: speed.id,
                },
            },
            drillUnit: 'time',
        },
    })

    const PassingDrill = await prisma.drill.create({
        data: {
            name: 'Passing Drill',
            category: {
                connect: {
                    id: passing.id,
                },
            },
            drillUnit: 'integral',
        },
    })

    const jumpHeightDrill = await prisma.drill.create({
        data: {
            name: 'Jump Height Drill',
            category: {
                connect: {
                    id: jumping.id,
                },
            },
            drillUnit: 'decimal',
        },
    })

    const _pushupDrill = await prisma.drill.create({
        data: {
            name: 'Push Up Drill',
            category: {
                connect: {
                    id: strength.id
                }
            },
            drillUnit: 'decimal'
        }

    })

    const _pullupDrill = await prisma.drill.create({
        data: {
            name: 'Pull Up Drill',
            category: {
                connect: {
                    id: strength.id
                }
            },
            drillUnit: 'decimal'
        }

    })

    //dont touc


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
