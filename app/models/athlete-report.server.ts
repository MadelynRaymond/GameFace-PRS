import { DrillEntry, Prisma, PrismaPromise } from '@prisma/client'
import { prisma } from '~/db.server'
import { Entry } from '~/routes/staff/athletes/$athleteId'

export async function createAthleteReport(athleteId: number) {
    return prisma.athleteReport.create({
        data: {
            user: {
                connect: {
                    id: athleteId,
                },
            },
        },
    })
}

export async function updateAthleteReport(reportId: number, entries: Entry[]) {
    //UPDATE DrillEntry SET value = $1, outOf =$2 WHERE reportId = $3 and drillId = $4

    const transactions = entries.map((e) => prisma.$executeRaw`UPDATE DrillEntry SET value = ${e.value}, outOf = ${e.outOf || undefined} WHERE reportId = ${reportId} and drillId = ${e.drillId}`)

    await prisma.$transaction(transactions)
}
