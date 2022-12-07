import type { ExerciseCategory } from "@prisma/client";
import { prisma } from "~/db.server";

export async function getDrillsInCategory({categoryId}: {categoryId: ExerciseCategory["id"]}) {
  return prisma.exerciseCategory.findMany({
    select: {
      drills: {
        where: {
          categoryId
        }
      }
    }
  })
}