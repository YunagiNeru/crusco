import { supabase } from '@/lib/supabase';
import { type Entry, type EntryKind } from '../types';

/**
 * DB から取得した生のデータを、アプリ内で扱う Entry 型に変換します。
 * 理由: DB は snake_case (created_at)、アプリは camelCase (createdAt) で統一したいため。
 */
const mapToEntry = (row: any): Entry => {
  return {
    id: row.id,
    kind: row.kind,
    content: row.content,
    isDone: row.is_done,
    orderRank: row.order_rank,
    width: row.width,
    height: row.height,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * すべてのエントリーを取得します。
 * ソート順: 更新日時が新しい順 (desc)
 */
export const getEntries = async (): Promise<Entry[]> => {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    // [穴埋め2] 削除されていないものだけ取得するフィルタを追加
    .is('deleted_at', null) 
    // [穴埋め3] order_rank の昇順で並び替える
    .order('order_rank', { ascending: true }); 

  if (error) {
    console.error('Error fetching entries:', error);
    return [];
  }
  return data.map(mapToEntry);
};

/**
 * 新規エントリーを作成します。
 * id, created_at, updated_at は Supabase 側で自動生成されるため、アプリからは送りません。
 */
export const createEntry = async (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entry> => {
  // DB に送る形 (snake_case) に直します
  const payload = {
    kind: entry.kind,
    content: entry.content,
    is_done: entry.isDone,
    width: entry.width,
    height: entry.height,
  };

  const { data, error } = await supabase
    .from('entries')
    .insert(payload)
    .select() // insert した結果（自動生成されたIDなど含む）を取得するために必要
    .single(); // 結果は配列ではなく1件だけ欲しい

  if (error) throw error;
  return mapToEntry(data);
};

/**
 * エントリーを更新します。
 */
export const updateEntry = async (id: string, updates: Partial<Entry>): Promise<Entry> => {
  // API に渡す payload を作ります。undefined の項目は更新されません。
  const payload: any = {};
  if (updates.kind !== undefined) payload.kind = updates.kind;
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.isDone !== undefined) {
    /* [穴埋め3] ここもカラム名変換が必要です */
    payload.is_done = updates.isDone; 
  }
  
  // 更新日時を現在時刻に更新（Supabase の trigger で自動更新していない場合、アプリ側で送るのが無難）
  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('entries')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapToEntry(data);
};

/**
 * エントリーを削除します。
 */
export const deleteEntry = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('entries')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
};

export const undoDeleteEntry = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('entries')
    // [穴埋め5] deleted_at をクリアする
    .update({ deleted_at: null })
    .eq('id', id);

  if (error) throw error;
};

/**
 * エントリーの並び順を一括更新します。
 * 配列の index をそのまま order_rank として保存します。
 */
export const updateEntriesOrder = async (entries: Entry[]): Promise<void> => {
  const updates = entries.map((entry, index) => ({
    id: entry.id,
    kind: entry.kind,
    content: entry.content,
    is_done: entry.isDone,
    order_rank: index, 
    width: entry.width,
    height: entry.height,
    deleted_at: entry.deletedAt,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('entries')
    .upsert(updates);

  if (error) throw error;
};