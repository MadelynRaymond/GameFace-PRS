import { prisma } from "~/db.server";

export async function createAthleteReport(athleteId: number) {
  return prisma.athleteReport.create({
    data: {
      user: {
        connect: {
          id: athleteId
        }
      }
    }
  })
}