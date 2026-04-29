/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_TEAM_1_LINKEDIN: string;
  readonly VITE_TEAM_1_PHOTO: string;
  readonly VITE_TEAM_2_LINKEDIN: string;
  readonly VITE_TEAM_2_PHOTO: string;
  readonly VITE_TEAM_3_LINKEDIN: string;
  readonly VITE_TEAM_3_PHOTO: string;
  readonly VITE_TEAM_4_LINKEDIN: string;
  readonly VITE_TEAM_4_PHOTO: string;
  readonly VITE_TEAM_5_LINKEDIN: string;
  readonly VITE_TEAM_5_PHOTO: string;
  readonly VITE_TEAM_6_LINKEDIN: string;
  readonly VITE_TEAM_6_PHOTO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
