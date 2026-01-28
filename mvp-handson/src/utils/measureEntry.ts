/**
 * メモのコンテンツから高さを正確に計算するユーティリティ
 * 
 * 注意: この定数値は src/index.css のCSS変数と厳密に同期させる必要があります。
 * --card-padding: 12px
 * --card-font-size: 14px
 * --card-line-height: 1.5
 * --card-border-width: 1px
 */

const CARD_PADDING = 12;
const CARD_FONT_SIZE = 14;
const CARD_LINE_HEIGHT = 1.5;
const CARD_BORDER_WIDTH = 1;

export const measureEntryHeight = (content: string, width: number): number => {
  let container = document.getElementById('measure-container');
  let contentDiv = document.getElementById('measure-content');

  if (!container || !contentDiv) {
    // コンテナ (Card相当)
    container = document.createElement('div');
    container.id = 'measure-container';
    container.style.position = 'absolute';
    container.style.visibility = 'hidden';
    container.style.boxSizing = 'border-box';
    container.style.border = `${CARD_BORDER_WIDTH}px solid transparent`;
    container.style.padding = `${CARD_PADDING}px`;
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.fontFamily = 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif';
    container.style.fontWeight = '400';
    
    // 内部 (ContentPreview相当)
    contentDiv = document.createElement('div');
    contentDiv.id = 'measure-content';
    contentDiv.style.fontSize = `${CARD_FONT_SIZE}px`;
    contentDiv.style.lineHeight = `${CARD_LINE_HEIGHT}`;
    contentDiv.style.whiteSpace = 'pre-wrap';
    contentDiv.style.wordBreak = 'break-all';
    contentDiv.style.flexGrow = '1';

    container.appendChild(contentDiv);
    document.body.appendChild(container);
  } else {
      // 既存のスタイルが更新されていない可能性を考慮し、念のため再適用（今回は省略可だが安全のため）
      container.style.width = ''; 
  }

  // 幅を設定 (Cardの外寸)
  container.style.width = `${width}px`;

  // コンテンツ設定
  // contentPreview と同じ条件にするため、空文字の場合は空にするか、Empty表示に合わせるか？
  // EntryCardは `entry.content || (Empty)` としているが、Emptyの時は高さが欲しい？
  // ユーザー入力時は `content` があるはず。
  // 空文字入力で作成できるか？ -> できないほうがいいが、できるなら1行分確保。
  if (!content) {
      contentDiv.textContent = ' '; // 1行分確保
  } else {
      contentDiv.textContent = content;
  }

  // 高さを取得
  const height = container.offsetHeight;

  // 1px のバッファを持たせて切り上げ (ブラウザのサブピクセルレンダリング対策)
  return Math.ceil(height) + 1;
};
