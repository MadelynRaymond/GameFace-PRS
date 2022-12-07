/*
  Warnings:

  - Added the required column `userId` to the `DrillEntry` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[DrillEntry] ADD [userId] INT NOT NULL;

-- AddForeignKey
ALTER TABLE [dbo].[DrillEntry] ADD CONSTRAINT [DrillEntry_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
