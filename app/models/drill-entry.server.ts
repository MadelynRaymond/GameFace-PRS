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
        data: entries.map(entry => {
            const { userId, drillId, ...score } = entry
            return (
                {
                    userId,
                    drillId,
                    reportId,
                    ...score
                }
            )
        })
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

export async function getEntriesByDrillLiteral({ drillName, userId, interval = new Date() }: { drillName: Drill['name']; userId: User['id']; interval?: Date }) {
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
