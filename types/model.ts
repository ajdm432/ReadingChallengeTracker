export enum ReadStatus {
  READ = "read",
  NOT_READ = "to_read",
  DNF = "dnf",
}

export const getStatusColor = (status: ReadStatus) => {
  switch (status) {
    case ReadStatus.NOT_READ:
      return "blue";
    case ReadStatus.READ:
      return "green";
    case ReadStatus.DNF:
      return "red";
    default:
      return "gray";
  }
};

export type ChallengeNoIds = {
  name: string;
  startDate?: string;
  endDate?: string;
  maxAssignmentsPerBook: number;
  categories: CategoryNoIds[];
};

export type Challenge = {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
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
  id: number | null;
  draftId?: string;
  challengeId: number;
  name: string;
  color: string;
  quota: number;
  assignedCount: number;
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

export type CategoryStatusForBook = {
  categoryId: number;
  color: string;
  name: string;
  isCandidate: boolean;
  isAssigned: boolean;
};

export type BookStatusForCategory = {
  title: string;
  bookId: number;
  author: string;
  isCandidate: boolean;
  isAssigned: boolean;
};
