// 3 MiB becomes 4 MiB of base64, leaving room below Vercel's 4.5 MB request limit.
export const AI_MAX_FILE_BYTES = 3 * 1024 * 1024;
export const AI_MAX_DATA_URL_LENGTH = 4 * Math.ceil(AI_MAX_FILE_BYTES / 3) + 64;
export const AI_MAX_REQUEST_BYTES = 4_300_000;
export const AI_UPLOAD_LIMIT_MESSAGE = 'AI extraction supports files up to 3 MB. Use a smaller source for AI extraction, or transcribe this file manually.';
