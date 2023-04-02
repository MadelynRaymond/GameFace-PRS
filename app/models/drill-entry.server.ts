import type { AthleteReport, Drill, User } from '@prisma/client'
import { prisma } from '~/db.server'
import type { AthleteFormDataType } from '~/routes/staff/athletes/$athleteId'


export async function createEntryOnReport(reportId: number, data: AthleteFormDataType) {
    const {entries, created_at} = data

    //update report date
    const res = await prisma.athleteReport.update({where: {id: reportId}, data: {created_at}})
    console.log(res)

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
    return prisma.drillEntry.findMany({
        select: {
            value: true,
            outOf: true,
            created_at: true
        },
        where: {
            userId,
            drill: {
                name: drillName
            }
        },
        orderBy: {
            created_at: 'desc'
        },
        take: sessions
    })
}

export async function getEntries({userId, drillName, interval = new Date()}: {userId: User['id'], drillName: Drill['name'], interval: Date}) {
    return prisma.drillEntry.findMany({
        where: {
            userId,
            drill: {
                name: drillName
            },
            created_at: {
                gte: interval
            }
        }
    })
}

export async function getEntriesByDrillLiteral({
    drillName,
    userId,
    interval,
}: {
    drillName: Drill['name']
    userId: User['id']
    interval?: Date
}) {
    const entries = await prisma.drillEntry.findMany({
        select: {
            value: true,
            outOf: true,
            created_at: true,
        },
        where: {
            drill: {
                name: drillName,
            },
            user: {
                id: userId,
            },
            created_at: {
                gte: interval
            }
        },
        orderBy: {
            created_at: 'asc'
        }
    })
    return entries
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


export async function getEntriesOnReport(reportId: AthleteReport['id'] ) {
    return await prisma.drillEntry.findMany({where: {reportId}})
}