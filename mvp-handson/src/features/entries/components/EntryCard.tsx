import { useEffect, useRef, useState } from 'react';
import { type Entry } from '../types';
// [修正] DotsSix を追加
import { TrashSimple, DotsSix, Notches } from '@phosphor-icons/react';
import styles from './EntryCard.module.css';
// 既存の import はそのまま維持してください
import { ResizableBox, type ResizeCallbackData } from 'react-resizable'; // 追加
import 'react-resizable/css/styles.css'; // 追加

type Props = {
  entry: Entry;
  isSelected: boolean;
  onSelect: (entry: Entry) => void;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  // [追加] DnD用のProps (リスナー等を含んだオブジェクトを受け取る)
  onResize?: (id: string, width: number, height: number) => void;
  dragHandleProps?: any; 
  viewMode?: 'list' | 'tile';
};

// Propsの型を適用
export const EntryCard = ({ 
  entry, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete,
  dragHandleProps,
  viewMode = 'tile', 
  onResize
}: Props) => {
  // ... (useState, useEffect, handleBlur などのロジックは変更なし) ...
  const [editingContent, setEditingContent] = useState(entry.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // [追加] ドラッグ中の描画用サイズ State
  const [drawingSize, setDrawingSize] = useState({
    width: entry.width || 200,
    height: entry.height || 200
  });

  // [追加] DB由来の entry.width/height が変わったら、ローカルStateも同期する
  useEffect(() => {
    // ちらつき防止: 現在のdrawingSizeとほぼ同じなら更新しない
    const newWidth = entry.width || 200;
    const newHeight = entry.height || 200;
    
    setDrawingSize(prev => {
      if (Math.abs(prev.width - newWidth) < 2 && Math.abs(prev.height - newHeight) < 2) {
        return prev;
      }
      return {
        width: newWidth,
        height: newHeight
      };
    });
  }, [entry.width, entry.height]);

  useEffect(() => {
     setEditingContent(entry.content);
  }, [entry.content]);

  useEffect(() => {
    if (isSelected && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingContent(e.target.value);
  };

  const handleBlur = () => {
    if (editingContent !== entry.content) {
      onUpdate(entry.id, editingContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // ...
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
      onDelete(entry.id);
  };

  const handleCardClick = () => {
    onSelect(entry);
  };
  
  // 共通パーツ: 削除ボタン
  const deleteButton = (
    <button className={styles.deleteButton} onClick={handleDeleteClick} title="Delete">
      <TrashSimple size={16} />
    </button>
  );

  // 共通パーツ: ドラッグハンドル
  const dragHandle = (
    <div className={styles.dragHandle} {...dragHandleProps}>
      <DotsSix size={24} color="#ccc" /> 
    </div>
  );

  // カードの中身を構築
  const cardMainParams = {
    className: `${styles.card} ${isSelected ? styles.selected : ''}`,
    style: { 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column' as const 
    },
    // Viewモードの時だけクリックで選択状態にする
    onClick: !isSelected ? handleCardClick : undefined, 
  };

  const cardContent = (
    <div {...cardMainParams}>
      {/* ハンドルと削除ボタンは共通して表示 */}
      {dragHandle}
      {deleteButton}

      {/* 編集モードか閲覧モードかで中身を切り替え */}
      {isSelected ? (
        <textarea
          ref={textareaRef}
          className={styles.editor}
          value={editingContent}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div className={styles.contentPreview}>
          {entry.content || <span style={{ color: '#ccc' }}>(Empty)</span>}
        </div>
      )}

      {/* タイル表示時のみリサイズハンドルアイコンを表示 */}
      {viewMode === 'tile' && (
        <div className={styles.resizableHandle}>
          <Notches size={16} />
        </div>
      )}
    </div>
  );

  // リスト表示ならそのまま返す
  if (viewMode === 'list') {
    return cardContent;
  }

  // タイル表示なら ResizableBox で囲って返す
  return (
    <ResizableBox
      width={drawingSize.width}
      height={drawingSize.height}
      minConstraints={[drawingSize.width, 40]} 
      maxConstraints={[drawingSize.width, 2000]}
      axis="y"
      resizeHandles={['s']}
      onResize={(e, data) => {
        setDrawingSize({
          width: data.size.width,
          height: data.size.height
        });
      }}
      onResizeStop={(e, data) => {
        // ここでも念のためローカルStateを更新
        setDrawingSize({
            width: data.size.width,
            height: data.size.height
        });
        onResize?.(entry.id, data.size.width, data.size.height);
      }}
      handle={<div className={styles.resizableHandle}><Notches size={16} /></div>}
    >
      {cardContent}
    </ResizableBox>
  );
};