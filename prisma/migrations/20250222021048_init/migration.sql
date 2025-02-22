-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL,
    "pacerCaseId" TEXT NOT NULL,
    "fullSummary" TEXT NOT NULL,
    "shortSummary" TEXT NOT NULL,
    "sourceDocuments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);
