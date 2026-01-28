import { type Entry, type EntryKind } from '../types';
import { EntryCard } from './EntryCard';
import { SortableEntry } from './SortableEntry';
import styles from './EntryList.module.css';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';

type Props = {
  kind: EntryKind;
  entries: Entry[];
  selectedId: string | null;
  onSelect: (id: string) => void; 
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  viewMode?: 'list' | 'tile';
  onReorder?: (newEntries: Entry[]) => void;
  onResize?: (id: string, width: number, height: number) => void;
};

export const EntryList = ({ 
  kind, 
  entries, 
  selectedId, 
  onSelect, 
  onUpdate,
  onDelete,
  viewMode = 'tile',
  onReorder,
  onResize
}: Props) => {
  const filteredEntries = entries.filter(entry => entry.kind === kind);
  const titleMap = { note: 'Notes', task: 'Tasks' };

  // ■ ドラッグ終了時の処理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // ドロップ先がない、移動していない、並び替え機能が無効な場合は無視
    if (!over || active.id === over.id || !onReorder) {
      return;
    }

    // 元の位置と新しい位置を検索
    // 注意: ここで検索対象にする配列は、表示に使っている `filteredEntries` です
    const oldIndex = filteredEntries.findIndex((e) => e.id === active.id);
    const newIndex = filteredEntries.findIndex((e) => e.id === over.id);

    // 新しい並び順の配列を作成
    const newSortedEntries = arrayMove(filteredEntries, oldIndex, newIndex);
    
    // 親に通知
    onReorder(newSortedEntries);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>{titleMap[kind]}</span>
      </div>

      <div className={styles.scrollArea}>
        {/* 
          DndContext: DnDの世界を作るコンテナ
          collisionDetection={closestCenter}: 「要素の中心」が近いところにドロップ判定をする（自然な挙動になる）
        */}
        <DndContext 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          {/* 
            SortableContext: ここにある items が「並び替え可能なもの」だと宣言する
            items: idを持つオブジェクトの配列、またはidの配列を渡す必要がある
            strategy: 並び替えの計算ロジック（今回は縦リスト用）
          */}
          <SortableContext 
            items={filteredEntries} 
            strategy={verticalListSortingStrategy}
          >
            <div className={viewMode === 'tile' ? styles.tileLayout : styles.listLayout}>
              {filteredEntries.map(entry => (
                <SortableEntry
                  key={entry.id}
                  entry={entry}
                  isSelected={entry.id === selectedId}
                  onSelect={(e) => onSelect(e.id)}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onResize={onResize}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};