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
    
    const username = 'rachel49'

    const user = await prisma.user.create({
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
                    grade: '9',
                    firstName: 'Rachel',
                    lastName: 'Wilson',
                },
            },
        },
    })

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
            drillUnit: "integral"
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
            drillUnit: "time"
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
            drillUnit: "time"
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
            drillUnit: "decimal"
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
            drillUnit: "time"
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
            drillUnit: "integral"
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
            drillUnit: "decimal"
        },
    })

    //dont touch
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
                //for instance: shots made
                value: 35,
                //for instance: shots attempted
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
                //value -> time (seconds)
                value: 75,
                //bestScore -> best time for entry
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

    await prisma.drillEntry.createMany({
        data: [
            {
                drillId: jumpDistanceDrill.id,
                //value -> time (seconds)
                value: 3,
                //bestScore -> best time for entry
                bestScore: 4,
                userId: user.id,
                reportId: report.id,
                unit: 'decimal',
            },
            {
                drillId: jumpDistanceDrill.id,
                value: 3,
                bestScore: 3,
                userId: user.id,
                reportId: report_two.id,
                unit: 'decimal',
            },
            {
                drillId: jumpDistanceDrill.id,
                value: 2,
                bestScore: 4,
                userId: user.id,
                reportId: report_three.id,
                unit: 'decimal',
            },
            {
                drillId: squatDrill.id,
                //value -> time (seconds)
                value: 15,
                //bestScore -> best time for entry
                bestScore: 26,
                userId: user.id,
                reportId: report.id,
                unit: 'time',
            },
            {
                drillId: squatDrill.id,
                value: 18,
                bestScore: 25,
                userId: user.id,
                reportId: report_two.id,
                unit: 'time',
            },
            {
                drillId: squatDrill.id,
                value: 22,
                bestScore: 25,
                userId: user.id,
                reportId: report_three.id,
                unit: 'time',
            },
        ],
    })

    await prisma.drillEntry.createMany({
        data: [
            {
                drillId: PassingDrill.id,
                //value -> time (seconds)
                value: 24,
                //bestScore -> best time for entry
                outOf: 35,
                userId: user.id,
                reportId: report.id,
                unit: 'integral',
            },
            {
                drillId: PassingDrill.id,
                value: 80,
                outOf: 90,
                userId: user.id,
                reportId: report_two.id,
                unit: 'integral',
            },
            {
                drillId: PassingDrill.id,
                value: 60,
                outOf: 94,
                userId: user.id,
                reportId: report_three.id,
                unit: 'integral',
            },
        ],
    })

    await prisma.drillEntry.createMany({
        data: [
            {
                drillId: speedDrill.id,
                //value -> time (seconds)
                value: 75,
                //bestScore -> best time for entry
                bestScore: 55,
                userId: user.id,
                reportId: report.id,
                unit: 'time',
            },
            {
                drillId: speedDrill.id,
                value: 80,
                bestScore: 45,
                userId: user.id,
                reportId: report_two.id,
                unit: 'time',
            },
            {
                drillId: speedDrill.id,
                value: 60,
                bestScore: 39,
                userId: user.id,
                reportId: report_three.id,
                unit: 'time',
            },
        ],
    })

    await prisma.drillEntry.createMany({
        data: [
            {
                drillId: jumpHeightDrill.id,
                //value -> time (seconds)
                value: 2,
                //bestScore -> best time for entry
                bestScore: 4,
                userId: user.id,
                reportId: report.id,
                unit: 'decimal',
            },
            {
                drillId: jumpHeightDrill.id,
                value: 3,
                bestScore: 3,
                userId: user.id,
                reportId: report_two.id,
                unit: 'decimal',
            },
            {
                drillId: jumpHeightDrill.id,
                value: 2,
                bestScore: 3,
                userId: user.id,
                reportId: report_three.id,
                unit: 'decimal',
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
