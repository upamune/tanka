import type React from 'react';
import type { TankaData } from '../types';
import { cn } from '../lib/utils';

interface Props {
  tanka: TankaData;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const TankaDisplay: React.FC<Props> = ({ tanka, containerRef }) => {
  // 50文字までに制限
  const displayText = tanka.text.slice(0, 50);
  const lines = displayText.split('\n');
  const hasContent = lines.some(line => line.trim().length > 0);

  // インラインスタイルとしてフォントを適用
  const style = {
    fontFamily: tanka.font,
    // フォントの読み込みを確実にするために重要なフォントプロパティを追加
    fontWeight: 400,
    fontStyle: 'normal',
    fontDisplay: 'block' as const,
    writingMode: tanka.isVertical ? 'vertical-rl' as const : 'horizontal-tb' as const,
    textOrientation: tanka.isVertical ? 'upright' as const : 'mixed' as const,
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full max-w-2xl mx-auto p-12 rounded-lg shadow-lg flex justify-center h-[400px] sm:h-[500px]",
        tanka.background
      )}
    >
      <div
        className={cn(
          "text-2xl md:text-3xl text-gray-800 text-center leading-relaxed flex",
          tanka.isVertical ? "items-start justify-center" : "flex-col items-center justify-center"
        )}
        style={style}
      >
        {hasContent ? (
          <div className={cn(
            "flex flex-col",
             tanka.isVertical && "items-start mt-12",
             )}>
            {lines.map((line, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: :(
              <div key={i} className={cn("my-3", tanka.isVertical && "ml-9")}>
                {line}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400">
            最高の短歌
          </div>
        )}
      </div>
    </div>
  );
};