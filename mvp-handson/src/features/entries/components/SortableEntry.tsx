import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EntryCard } from './EntryCard';
import { type Entry } from '../types';

type Props = {
  entry: Entry;
  isSelected: boolean;
  onSelect: (entry: Entry) => void; // EntryCard に合わせる
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onResize?: (id: string, width: number, height: number) => void;
};

export const SortableEntry = (props: Props) => {
  // useSortable は、IDを渡すと「ドラッグに必要な道具」を一式返してくれます
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.entry.id });

  // カードが移動する計算結果 (transform) を CSS 文字列に変換
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // ドラッグ中は少し透明にして「浮いている感」を出す
    opacity: isDragging ? 0.5 : 1, 
    zIndex: isDragging ? 999 : 'auto', 
  };

  return (
    // 1. ラッパー div に ref と style を渡して、位置を制御させる
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* 
         2. EntryCard にリスナー (onClick, onMouseDown等) を渡す。
            これを dragHandleProps として渡すことで、ハンドル部分でのみ反応するようになる
      */}
      <EntryCard 
        {...props}
        dragHandleProps={listeners} 
      />
    </div>
  );
};