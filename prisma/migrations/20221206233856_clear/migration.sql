BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Token] (
    [userId] INT NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Token_userId_key] UNIQUE NONCLUSTERED ([userId]),
    CONSTRAINT [Token_token_userId_key] UNIQUE NONCLUSTERED ([token],[userId])
);

-- AddForeignKey
ALTER TABLE [dbo].[Token] ADD CONSTRAINT [Token_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
