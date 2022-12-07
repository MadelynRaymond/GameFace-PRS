import { prisma } from "~/db.server";

export async function getExerciseCategories() {
  return prisma.exerciseCategory.findMany()
}