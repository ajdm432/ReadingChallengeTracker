export enum ReadStatus {
  READ = "read",
  NOT_READ = "to_read",
  DNF = "dnf",
}

export const getStatusColor = (status: ReadStatus) => {
  switch (status) {
    case ReadStatus.NOT_READ:
      return "#b985f9ff";
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
  notes: string | null;
};

export type Category = {
  id: number | null;
  draftId?: string;
  challengeId: number;
  name: string;
  color: string;
  quota: number;
  assignedCount: number;
  notes: string | null;
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
