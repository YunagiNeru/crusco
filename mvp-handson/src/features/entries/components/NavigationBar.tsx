import { useEffect, useRef, useState } from 'react';
import { GridFour, Rows, UploadSimple } from '@phosphor-icons/react';
import styles from './NavigationBar.module.css';

type Props = {
  onCreate: (content: string) => void;
  onToggleView: () => void;
  onUpload: () => void;
  // 追加: 現在の表示モード ('list' or 'tile')
  viewMode: 'list' | 'tile';
};

export const NavigationBar = ({ 
  onCreate, 
  // [穴埋め3] onDelete 引数を削除
  onToggleView, 
  onUpload, 
  viewMode 
}: Props) => {
  const [text, setText] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!text.trim()) return;
      onCreate(text);
      setText('');
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.iconButton} onClick={onUpload} title="Upload File">
        <UploadSimple size={32} />
      </button>
      
      <div className={styles.inputWrapper}>
        <textarea
          ref = {textareaRef}
          className = {styles.textInput}
          placeholder = "メモを入力..."
          value = {text}
          onChange = {(e) => setText(e.target.value)}
          onKeyDown = {handleKeyDown}
          rows = {1}
        />
      </div>

      <button className={styles.iconButton} onClick={onToggleView} title="Toggle View">
        {/* viewMode が 'list' ならタイルアイコン(GridFour)を出し、「次はタイルになるよ」と示唆 */}
        {/* viewMode が 'tile' ならリストアイコン(Rows)を出し、「次はリストになるよ」と示唆 */}
        {/* もしくは単純に「今の状態」を表すアイコンを出す流儀もありますが、今回は「今の状態」を出します */}
        {viewMode === 'list' ? <GridFour size={32} /> : <Rows size={32} /> }
      </button>
    </div>
  );
};