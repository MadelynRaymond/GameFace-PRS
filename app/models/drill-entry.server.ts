import { Drill, User } from "@prisma/client"
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


export async function getEntriesForDrill({drillId, userId, interval= new Date()}: {drillId: Drill["id"], userId: User["id"], interval: Date}) {
  return prisma.athleteReport.findMany({
    select: {
      entries: {
        where: {
          drillId,
          created_at: {
            lte: new Date(),
            gte: interval
          }
        },
        select: {
          score: true
        }
      }
    },
    where: {
      userId
    }
  })

}