import React from 'react';
import { TankaData } from '../types';

interface Props {
  tanka: TankaData;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const TankaDisplay: React.FC<Props> = ({ tanka, containerRef }) => {
  const formattedTanka = tanka.text.split('\n').map((line, i) => (
    <div key={i} className="my-2">
      {line}
    </div>
  ));

  // インラインスタイルとしてフォントを適用
  const style = {
    fontFamily: tanka.font,
    // フォントの読み込みを確実にするために重要なフォントプロパティを追加
    fontWeight: 400,
    fontStyle: 'normal',
    fontDisplay: 'block' as const,
  };

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-2xl mx-auto p-12 rounded-lg shadow-lg ${tanka.background}`}
    >
      <div
        className="text-2xl md:text-3xl text-gray-800 text-center leading-relaxed"
        style={style}
      >
        {formattedTanka}
      </div>
    </div>
  );
};