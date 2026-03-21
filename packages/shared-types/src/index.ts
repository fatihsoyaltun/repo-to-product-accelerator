export type RepoFingerprint = {
  repoName: string;
  repoUrl: string;
  primaryLanguage: string | null;
  detectedFrameworks: string[];
  capabilities: string[];
  maturityScore: number;
  notes: string[];
};
