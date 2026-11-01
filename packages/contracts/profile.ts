export type UserProfile = {
  sub: string;
  firstName: string;
  lastName: string;
  alias: string;
  avatar: string | null;
  avatarUrl: string | null;
  email?: string;
};

export type ProfileUpdate = {
  firstName?: string;
  lastName?: string;
  alias?: string;
  avatar?: {
    filename: string;
    mimeType: string;
    bytes: Uint8Array;
  };
};

export type ProfileErrorCode =
  "VALIDATION" | "UNAUTHORIZED" | "FORBIDDEN" | "CONFLICT" | "UPSTREAM";

export type ProfileError = {
  code: ProfileErrorCode;
  message: string;
  fields?: Record<string, string[]>;
};
