import type { Drill, User } from '@prisma/client'
import { prisma } from '~/db.server'

type DrillEntry = {
    userId: number
    drillId: number
    value: number
    outOf?: number
    bestScore?: number
    unit: string
}

export async function createEntryOnReport(reportId: number, entries: DrillEntry[]) {
    return prisma.drillEntry.createMany({
        data: entries.map((entry) => {
            const { userId, drillId, ...score } = entry
            return {
                userId,
                drillId,
                reportId,
                ...score,
            }
        }),
    })
}

export async function getEntriesLastNReports({ drillName, userId, sessions }: { drillName: Drill['name']; userId: User['id']; sessions: number }) {
    return prisma.athleteReport.findMany({
        select: {
            created_at: true,
            entries: {
                select: {
                    value: true,
                    outOf: true,
                    unit: true,
                    bestScore: true,
                },
                where: {
                    drill: {
                        name: drillName,
                    },
                },
            },
        },
        orderBy: {
            created_at: 'asc',
        },
        where: {
            userId,
        },
        take: sessions,
    })
}

export async function getEntriesByDrillLiteral({
    drillName,
    userId,
    interval = new Date(),
}: {
    drillName: Drill['name']
    userId: User['id']
    interval?: Date
}) {
    return prisma.drillEntry.findMany({
        select: {
            value: true,
            outOf: true,
            unit: true,
            bestScore: true,
        },
        where: {
            drill: {
                name: drillName,
            },
            user: {
                id: userId,
            },
        },
    })
}

export async function getEntriesAverage({ drillName, userId, interval }: { drillName: Drill['name']; userId: User['id']; interval?: Date }) {
    return prisma.drillEntry.aggregate({
        _avg: {
            value: true,
            bestScore: true,
        },
        where: {
            user: {
                id: userId,
            },
            drill: {
                name: drillName,
            },
            created_at: {
                gte: interval,
            },
        },
    })
}

export async function getEntriesMax({ drillName, userId, interval }: { drillName: Drill['name']; userId: User['id']; interval?: Date }) {
    return prisma.drillEntry.aggregate({
        _max: {
            value: true,
            bestScore: true,
        },
        where: {
            user: {
                id: userId,
            },
            drill: {
                name: drillName,
            },
            created_at: {
                gte: interval,
            },
        },
    })
}

export async function getEntriesMin({ drillName, userId, interval }: { drillName: Drill['name']; userId: User['id']; interval?: Date }) {
    return prisma.drillEntry.aggregate({
        _min: {
            value: true,
            bestScore: true,
        },
        where: {
            user: {
                id: userId,
            },
            drill: {
                name: drillName,
            },
            created_at: {
                gte: interval,
            },
        },
    })
}

export async function getEntriesTotal({ drillName, userId, interval }: { drillName: Drill['name']; userId: User['id']; interval?: Date }) {
    return prisma.drillEntry.aggregate({
        _sum: {
            value: true,
            bestScore: true,
            outOf: true,
        },
        where: {
            user: {
                id: userId,
            },
            drill: {
                name: drillName,
            },
            created_at: {
                gte: interval,
            },
        },
    })
}

export async function getEntriesAggregate({ drillName, userId, interval }: { drillName: Drill['name']; userId: User['id']; interval?: Date }) {
    const aggregations = await prisma.drillEntry.aggregate({
        _min: {
            value: true,
        },
        _max: {
            value: true,
        },
        _avg: {
            value: true,
        },
        where: {
            user: {
                id: userId,
            },
            drill: {
                name: drillName,
            },
            created_at: {
                gte: interval,
            },
        },
    })

    return { min: aggregations._min.value, max: aggregations._max.value, average: aggregations._avg.value }
}
