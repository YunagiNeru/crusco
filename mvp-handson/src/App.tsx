import { useEffect, useState } from 'react';
import { type Entry, type EntryKind } from './features/entries/types';
import { getEntries, createEntry, updateEntry, deleteEntry, undoDeleteEntry, updateEntriesOrder } from './features/entries/api';
import { EntryList } from './features/entries/components/EntryList';
import { NavigationBar } from './features/entries/components/NavigationBar';
import { useToast } from './components/ui/toast/ToastContext';
import styles from './App.module.css';

function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 表示モード管理
  const [viewMode, setViewMode] = useState<'list' | 'tile'>('tile');

  // ... useEffect, fetchEntries はそのまま ...
  // ※ ここは変更なしなので省略 (前のままでOK)
  useEffect(() => {
    fetchEntries();
  }, []);
  const fetchEntries = async () => {
    const data = await getEntries();
    setEntries(data);
  };


  // ■ 作成ロジック (引数が変わります！)
  // NavigationBar から content だけ渡されてくるので、kind はどうする？
  // 要望では「中央下部にナビゲーションバー」なので、これは「メモ作成」専用と捉えて良さそうです。
  // (タスクは左カラムで別途作ることになりますが、今回は簡易的にここからは note を作ることにします)
  /* import { measureEntryHeight } from './utils/measureEntry'; // REMOVE THIS */
  
  const handleCreateNote = async (content: string) => {
    // 簡易的な初期サイズ
    const fixedWidth = 200; 
    const fixedHeight = 60; // Default height

    const newEntry = await createEntry({
      kind: 'note',
      content: content,
      isDone: false,
      orderRank: 0,
      width: fixedWidth,
      height: fixedHeight,
      deletedAt: null,
    });
    await fetchEntries();
    setSelectedId(newEntry.id);
  };

  const handleSelect = (id: string) => setSelectedId(id);
  
  const handleUpdate = async (id: string, updates: Partial<Entry>) => {
      await updateEntry(id, updates);
      setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e));
  };
  
  const { showToast } = useToast();

  const handleDelete = async (id: string) => {
      if (!id) return;
      await deleteEntry(id);
      await fetchEntries();
      showToast('メモを削除しました', {
        action: {
          label: '元に戻す',
          onClick: async () => {
            await undoDeleteEntry(id);
            await fetchEntries();
            showToast('メモを元に戻しました');
          }
        }
      });
  };
  
  const handleInlineUpdate = (id: string, content: string) => {
      handleUpdate(id, { content });
  };
 
  /* Removing handleReorder and handleResize */

  return (
    <div className={styles.container}>
      {/* メインエリア (2カラム) */}
      <div className={styles.mainArea}>
        <div className={styles.colTask}>
          <EntryList
            kind="task" // Add props as expected by Reverted EntryList
            viewMode={viewMode} // Add viewMode
            entries={entries}
            selectedId={selectedId}
            onSelect={handleSelect}
            onUpdate={handleInlineUpdate} // Prop name in Reverted EntryList is onUpdate (not onUpdateEntry)
            onDelete={handleDelete} // Prop name is onDelete (not onDeleteEntry)
             // removed onReorder, onResize
          />
        </div>

        <div className={styles.colNote}>
          <EntryList
            kind="note"
            entries={entries}
            selectedId={selectedId}
            onSelect={handleSelect}
            onUpdate={handleInlineUpdate}
            onDelete={handleDelete}
            viewMode={viewMode}
             // removed onReorder, onResize
          />
        </div>
      </div>


      {/* フッター (ナビゲーションバー) */}
      <div className={styles.footer}>
        <NavigationBar
          onCreate={handleCreateNote}
          onToggleView={() => setViewMode(prev => prev === 'list' ? 'tile' : 'list')}
          onUpload={() => alert('Future feature!')}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
}

export default App;