/*
  Warnings:

  - You are about to drop the column `elapsed` on the `Score` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Score] DROP COLUMN [elapsed];
ALTER TABLE [dbo].[Score] ADD [end] TIME,
[start] TIME;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
