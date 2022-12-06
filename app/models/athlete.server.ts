import type { User } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getReportsFromAthlete(athleteId: User["id"]) {
  return prisma.athleteReport.findMany({
    where: {
      userId: athleteId
    },
    select: {
      id: true,
      created_at: true
    }
  })
}

//TODO: filter by role athlete vs staff
export async function getAthletes() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      profile: true
    },
    orderBy: {
      profile: {
        firstName: 'asc'
      }
    }
  })
}

export async function getAthleteWithReports(athleteId: User["id"]) {
  return prisma.user.findUnique({
    where: {id: athleteId},
    select: {
      reports: {
        select: {
          id: true,
          created_at: true
        },
        orderBy: {
          created_at: 'desc'
        }
      },
      profile: {
        select: {
          firstName: true,
          lastName: true,
          grade: true,
        }
      }
    }
  })
}