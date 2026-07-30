-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "manageToken" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'sunset',
    "gradientFrom" TEXT,
    "gradientVia" TEXT,
    "gradientTo" TEXT,
    "gifUrl" TEXT,
    "evasiveNo" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ActivityOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proposalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "emoji" TEXT NOT NULL DEFAULT '🎉',
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ActivityOption_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityOptionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startsAt" TEXT,
    CONSTRAINT "TimeSlot_activityOptionId_fkey" FOREIGN KEY ("activityOptionId") REFERENCES "ActivityOption" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proposalId" TEXT NOT NULL,
    "selectedActivityId" TEXT,
    "selectedTimeSlotId" TEXT,
    "answer" TEXT NOT NULL,
    "note" TEXT,
    "respondedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Response_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Response_selectedActivityId_fkey" FOREIGN KEY ("selectedActivityId") REFERENCES "ActivityOption" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Response_selectedTimeSlotId_fkey" FOREIGN KEY ("selectedTimeSlotId") REFERENCES "TimeSlot" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_slug_key" ON "Proposal"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_manageToken_key" ON "Proposal"("manageToken");

-- CreateIndex
CREATE UNIQUE INDEX "Response_proposalId_key" ON "Response"("proposalId");
