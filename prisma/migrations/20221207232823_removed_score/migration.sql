/*
  Warnings:

  - You are about to drop the `Score` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `unit` to the `DrillEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `DrillEntry` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Score] DROP CONSTRAINT [Score_entry_id_fkey];

-- AlterTable
ALTER TABLE [dbo].[DrillEntry] ADD [bestScore] INT,
[outOf] INT,
[unit] NVARCHAR(1000) NOT NULL,
[value] INT NOT NULL;

-- DropTable
DROP TABLE [dbo].[Score];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
