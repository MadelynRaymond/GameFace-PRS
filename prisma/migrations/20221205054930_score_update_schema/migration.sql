/*
  Warnings:

  - You are about to drop the column `value` on the `Score` table. All the data in the column will be lost.
  - You are about to alter the column `outOf` on the `Score` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `score` to the `Score` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Score" (
    "score" INTEGER NOT NULL,
    "outOf" INTEGER,
    "elapsed" DATETIME,
    "unit" TEXT NOT NULL,
    "entry_id" INTEGER NOT NULL,
    CONSTRAINT "Score_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "DrillEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Score" ("entry_id", "outOf", "unit") SELECT "entry_id", "outOf", "unit" FROM "Score";
DROP TABLE "Score";
ALTER TABLE "new_Score" RENAME TO "Score";
CREATE UNIQUE INDEX "Score_entry_id_key" ON "Score"("entry_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
