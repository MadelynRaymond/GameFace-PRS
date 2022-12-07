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
      user: {
        connect: {
          id: userId
        }
      },
      score: {
        create: scoreDetails
      }
    }
  })
}

export async function getEntriesLastNReports({drillName, userId, sessions}: {drillName: Drill["name"], userId: User['id'], sessions: number}) {
  return prisma.athleteReport.findMany({
    select: {
      created_at: true,
      entries: {
        select: {
          score: true
        },
        where: {
          drill: {
            name: drillName
          }
        }
      },
    },
    where: {
      userId
    },
    take: sessions
  })
}


export async function getEntriesByDrillLiteral({drillName, userId, interval=new Date()}: {drillName: Drill["name"], userId: User['id'], interval?: Date}) {
  return prisma.drillEntry.findMany({
    select: {
      score: {
        select: {
          value: true,
          outOf: true,
          bestScore: true
        }
      }
    },
    where: {
      drill: {
        name: drillName
      },
      user: {
        id: userId
      }
    }
  })
}

export async function getEntriesByDrillTime({drillName, userId, interval=new Date()}: {drillName: Drill["name"], userId: User['id'], interval?: Date}) {
  return prisma.drillEntry.findMany({
    select: {
      score: {
        select: {
          time: true,
          bestTime: true
        }
      }
    },
    where: {
      drill: {
        name: drillName
      },
      user: {
        id: userId
      }
    }
  })
}