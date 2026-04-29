/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface TeamConfig {
  TEAM_1_LINKEDIN: string;
  TEAM_1_PHOTO: string;
  TEAM_2_LINKEDIN: string;
  TEAM_2_PHOTO: string;
  TEAM_3_LINKEDIN: string;
  TEAM_3_PHOTO: string;
  TEAM_4_LINKEDIN: string;
  TEAM_4_PHOTO: string;
  TEAM_5_LINKEDIN: string;
  TEAM_5_PHOTO: string;
  TEAM_6_LINKEDIN: string;
  TEAM_6_PHOTO: string;
}

declare const __TEAM__: TeamConfig | undefined;

interface Window {
  __TEAM__?: TeamConfig;
}
