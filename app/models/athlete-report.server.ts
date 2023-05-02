import { DrillEntry, Prisma } from '@prisma/client'
import { prisma } from '~/db.server'
import { AthleteFormDataType, Entry } from '~/routes/staff/athletes/$athleteId'

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

export async function getAthleteReport(reportId: number) {
    return await prisma.athleteReport.findUnique({
        where: { id: reportId },
        select: {
            entries: true,
            created_at: true,
        },
    })

}

export async function updateAthleteReport(reportId: number, data: AthleteFormDataType) {
    const { entries, created_at } = data
    //UPDATE DrillEntry SET value = $1, outOf =$2 WHERE reportId = $3 and drillId = $4

    const transactions = [
        ...entries.map(
            (e) =>
                prisma.$executeRaw`UPDATE DrillEntry SET value = ${e.value}, outOf = ${e.outOf || undefined}, created_at = ${created_at} WHERE reportId = ${reportId} and drillId = ${
                    e.drillId
                }`
        ),
        prisma.$executeRaw`UPDATE AthleteReport SET created_at = ${created_at} WHERE id = ${reportId}`
    ]

    await prisma.$transaction(transactions)
}
