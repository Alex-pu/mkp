UPDATE "votes"
SET "voterToken" = CONCAT('legacy_', "id")
WHERE "voterToken" IS NULL;

ALTER TABLE "votes"
ALTER COLUMN "voterToken" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "votes_pollId_voterToken_key"
ON "votes" ("pollId", "voterToken");