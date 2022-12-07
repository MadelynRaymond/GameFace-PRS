/*
  Warnings:

  - You are about to drop the column `end` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `start` on the `Score` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Score] DROP COLUMN [end],
[start];
ALTER TABLE [dbo].[Score] ADD [bestScore] INT,
[bestTime] NVARCHAR(1000),
[time] NVARCHAR(1000);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
