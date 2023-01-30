import type { ExerciseCategory } from '@prisma/client'
import { prisma } from '~/db.server'

export async function getDrillsInCategory({ categoryId }: { categoryId: ExerciseCategory['id'] }) {
    return prisma.drill.findMany({
        where: {
            category: {
                id: categoryId,
            },
        },
    })
}

export async function getDrills() {
    return prisma.drill.findMany({
        orderBy: {
            category: {
                name: 'asc',
            },
        },
    })
}
