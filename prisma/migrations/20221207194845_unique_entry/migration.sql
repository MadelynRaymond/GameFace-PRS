/*
  Warnings:

  - You are about to drop the column `score` on the `Score` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reportId,drillId]` on the table `DrillEntry` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Score] DROP COLUMN [score];
ALTER TABLE [dbo].[Score] ADD [value] INT;

-- CreateIndex
ALTER TABLE [dbo].[DrillEntry] ADD CONSTRAINT [DrillEntry_reportId_drillId_key] UNIQUE NONCLUSTERED ([reportId], [drillId]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
