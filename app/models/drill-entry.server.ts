import { prisma } from "~/db.server"


type DrillEntry = {
  userId: number,
  drillId: number,
  score: number,
  outOf?: number,
  start?: string,
  end?: string,
  unit: string,
}

export async function createEntryOnReport(reportId: number, entryDetails: DrillEntry){
  const {userId, drillId, ...scoreDetails} = entryDetails
  return prisma.drillEntry.create({
    data: {
      drill: {
        connect: {
          id: drillId
        }
      },
      report: {
        connect: {
          id: reportId
        }
      },
      score: {
        create: scoreDetails
      }
    }
  })
}