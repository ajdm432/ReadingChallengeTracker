export enum ReadStatus {
  READ = "READ",
  NOT_READ = "NOT_READ",
  DNF = "DID_NOT_FINISH",
}

export type ChallengeNoIds = {
  name: string;
  startDate: string;
  endDate: string;
  maxAssignmentsPerBook: number;
  categories: CategoryNoIds[];
};

export type Challenge = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  maxAssignmentsPerBook: number;
  categories: Category[];
};

export type CategoryNoIds = {
  name: string;
  color: string;
  quota: number;
  subcategories: Subcategory[];
};

export type Category = {
  id: number;
  challengeId: number;
  name: string;
  color: string;
  quota: number;
  subcategories: Subcategory[];
};

export type Subcategory = {
  id: number;
  categoryId: number;
  name: string;
  color: string;
};

export type BookNoIds = {
  challengeId: number;
  title: string;
  author?: string;
  coverUri?: string;
  source?: string;
};

export type Book = {
  id: number;
  challengeId: number;
  title: string;
  author?: string;
  coverUri?: string;
  source?: string;
  readStatus: ReadStatus;
  subcategory?: Subcategory;
  isAssigned?: boolean;
};

export type CategoryProgress = {
  categoryId: number;
  name: string;
  color: string;
  quota: number;
  assignedCount: number;
  isComplete: boolean;
};

export type ChallengeSummary = {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  overallPercent: number;
};
