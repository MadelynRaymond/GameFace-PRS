/*
  Warnings:

  - Added the required column `age` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[StudentProfile] ADD [age] NVARCHAR(1000) NOT NULL,
[school] NVARCHAR(1000) NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
