/*
  Warnings:

  - You are about to drop the column `userId` on the `Token` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userEmail]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userEmail,token]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userEmail` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[Token] DROP CONSTRAINT [Token_userId_fkey];

-- DropIndex
ALTER TABLE [dbo].[Token] DROP CONSTRAINT [Token_token_userId_key];

-- DropIndex
ALTER TABLE [dbo].[Token] DROP CONSTRAINT [Token_userId_key];

-- AlterTable
ALTER TABLE [dbo].[Token] DROP COLUMN [userId];
ALTER TABLE [dbo].[Token] ADD [userEmail] NVARCHAR(1000) NOT NULL;

-- CreateIndex
ALTER TABLE [dbo].[Token] ADD CONSTRAINT [Token_userEmail_key] UNIQUE NONCLUSTERED ([userEmail]);

-- CreateIndex
ALTER TABLE [dbo].[Token] ADD CONSTRAINT [Token_userEmail_token_key] UNIQUE NONCLUSTERED ([userEmail], [token]);

-- AddForeignKey
ALTER TABLE [dbo].[Token] ADD CONSTRAINT [Token_userEmail_fkey] FOREIGN KEY ([userEmail]) REFERENCES [dbo].[User]([email]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
