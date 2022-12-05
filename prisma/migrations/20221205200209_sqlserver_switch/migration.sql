BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [email] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[StudentProfile] (
    [grade] NVARCHAR(1000) NOT NULL,
    [firstName] NVARCHAR(1000) NOT NULL,
    [lastName] NVARCHAR(1000) NOT NULL,
    [userId] INT NOT NULL,
    CONSTRAINT [StudentProfile_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[Password] (
    [hash] NVARCHAR(1000) NOT NULL,
    [userId] INT NOT NULL,
    CONSTRAINT [Password_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[ExerciseCategory] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ExerciseCategory_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ExerciseCategory_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[Drill] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [categoryId] INT NOT NULL,
    CONSTRAINT [Drill_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Drill_categoryId_name_key] UNIQUE NONCLUSTERED ([categoryId],[name])
);

-- CreateTable
CREATE TABLE [dbo].[DrillEntry] (
    [id] INT NOT NULL IDENTITY(1,1),
    [created_at] DATETIME2 NOT NULL CONSTRAINT [DrillEntry_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [userId] INT NOT NULL,
    [drillId] INT NOT NULL,
    CONSTRAINT [DrillEntry_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DrillEntry_drillId_key] UNIQUE NONCLUSTERED ([drillId])
);

-- CreateTable
CREATE TABLE [dbo].[Score] (
    [score] INT,
    [outOf] INT,
    [elapsed] DATETIME2,
    [unit] NVARCHAR(1000) NOT NULL,
    [entry_id] INT NOT NULL,
    CONSTRAINT [Score_entry_id_key] UNIQUE NONCLUSTERED ([entry_id])
);

-- AddForeignKey
ALTER TABLE [dbo].[StudentProfile] ADD CONSTRAINT [StudentProfile_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Password] ADD CONSTRAINT [Password_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Drill] ADD CONSTRAINT [Drill_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[ExerciseCategory]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[DrillEntry] ADD CONSTRAINT [DrillEntry_drillId_fkey] FOREIGN KEY ([drillId]) REFERENCES [dbo].[Drill]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[DrillEntry] ADD CONSTRAINT [DrillEntry_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Score] ADD CONSTRAINT [Score_entry_id_fkey] FOREIGN KEY ([entry_id]) REFERENCES [dbo].[DrillEntry]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
