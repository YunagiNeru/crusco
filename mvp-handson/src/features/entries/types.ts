export type EntryKind = 'note' | 'task';

export interface Entry {
  id: string;
  kind: EntryKind;
  content: string;
  isDone: boolean; // for task
  orderRank: number; // LexoRank string or number
  width: number;
  height: number;
  deletedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}