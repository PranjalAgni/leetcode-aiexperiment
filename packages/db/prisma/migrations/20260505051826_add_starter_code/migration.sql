-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "judge_metadata" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "starter_code" JSONB NOT NULL DEFAULT '{}';
