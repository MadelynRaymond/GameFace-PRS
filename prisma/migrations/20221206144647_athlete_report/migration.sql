/*
  Warnings:

  - You are about to drop the column `userId` on the `DrillEntry` table. All the data in the column will be lost.
  - Added the required column `reportId` to the `DrillEntry` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[DrillEntry] DROP CONSTRAINT [DrillEntry_userId_fkey];

-- DropIndex
ALTER TABLE [dbo].[DrillEntry] DROP CONSTRAINT [DrillEntry_drillId_key];

-- AlterTable
ALTER TABLE [dbo].[DrillEntry] DROP COLUMN [userId];
ALTER TABLE [dbo].[DrillEntry] ADD [reportId] INT NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[AthleteReport] (
    [id] INT NOT NULL IDENTITY(1,1),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [AthleteReport_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [userId] INT NOT NULL,
    CONSTRAINT [AthleteReport_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[AthleteReport] ADD CONSTRAINT [AthleteReport_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[DrillEntry] ADD CONSTRAINT [DrillEntry_reportId_fkey] FOREIGN KEY ([reportId]) REFERENCES [dbo].[AthleteReport]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
