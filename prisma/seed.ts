import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: "e23h9hiwo$won"
        }
      },
      profile: {
        create: {
          grade: "9",
          firstName: "Rachel",
          lastName: "Wilson"
        }
      }
    }
  })

  const shooting = await prisma.exerciseCategory.create({data: {name: "Shooting"}})

  const freeThrowDrill = await prisma.drill.create({
    data: {
      name: "Free Throws",
      category: {
        connect: {
          id: shooting.id
        }
      }
    }
  })

  const drillEntry = await prisma.drillEntry.create({
    data: {
      drill: {
        connect: {
          id: freeThrowDrill.id
        }
      },
      user: {
        connect: {
          id: user.id
        }
      },
      score: {
        create: {
          score: 35,
          outOf: 50,
          unit: "literal"
        }
      }
    }
  })


  console.log(`Database has been seeded. 🌱`);

  console.log(JSON.stringify(drillEntry))
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });