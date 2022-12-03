-- CreateTable
CREATE TABLE "StudentProfile" (
    "grade" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExerciseCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Drill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    CONSTRAINT "Drill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExerciseCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DrillEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "drillId" INTEGER NOT NULL,
    CONSTRAINT "DrillEntry_drillId_fkey" FOREIGN KEY ("drillId") REFERENCES "Drill" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DrillEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Score" (
    "value" TEXT NOT NULL,
    "outOf" TEXT,
    "unit" TEXT NOT NULL,
    "entry_id" INTEGER NOT NULL,
    CONSTRAINT "Score_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "DrillEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseCategory_name_key" ON "ExerciseCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Drill_categoryId_name_key" ON "Drill"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "DrillEntry_drillId_key" ON "DrillEntry"("drillId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_entry_id_key" ON "Score"("entry_id");
