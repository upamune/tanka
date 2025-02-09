import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Toaster, toast } from 'react-hot-toast';
import { TankaDisplay } from './components/TankaDisplay';
import { Controls } from './components/Controls';
import type { TankaData } from './types';
import { FONTS, BACKGROUNDS } from './constants';

function App() {
  const [tanka, setTanka] = useState<TankaData>({
    text: '秋の夜の\n長月夜には\n月を見て\n物思ふ事も\n多くなりけり',
    font: FONTS[0].family,
    background: BACKGROUNDS[0],
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (containerRef.current) {
      setIsGenerating(true);
      try {
        // フォントの読み込みを待つ
        await document.fonts.ready;
        
        // フォントの読み込み完了を待機
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 現在のスタイルをインラインで適用
        const computedStyle = window.getComputedStyle(containerRef.current);
        const inlineStyle = {
          fontFamily: computedStyle.fontFamily,
          fontSize: computedStyle.fontSize,
          fontWeight: computedStyle.fontWeight,
          lineHeight: computedStyle.lineHeight,
          letterSpacing: computedStyle.letterSpacing,
          textRendering: 'optimizeLegibility',
        };
        
        const dataUrl = await toPng(containerRef.current, {
          quality: 1.0,
          pixelRatio: 2,
          skipAutoScale: true,
          style: inlineStyle,
          filter: (node) => {
            // 画像生成中の表示を除外
            return !node.classList?.contains('absolute');
          },
        });
        
        const link = document.createElement('a');
        link.download = 'tanka.png';
        link.href = dataUrl;
        link.click();
        toast.success('画像を保存しました');
      } catch (error) {
        console.error('Image generation error:', error);
        toast.error('画像の生成に失敗しました。ブラウザをリロードして再度お試しください。');
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleShare = () => {
    const params = new URLSearchParams();
    
    // 各パラメータを設定
    params.set('text', tanka.text);
    params.set('font', tanka.font);
    params.set('bg', tanka.background);
    
    // 現在のパスを保持しつつ、クエリパラメータを更新
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success('共有用URLをコピーしました'));
  };

  // Load from URL params on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const textParam = params.get('text');
    const fontParam = params.get('font');
    const bgParam = params.get('bg');

    if (textParam || fontParam || bgParam) {
      setTanka({
        text: textParam || tanka.text,
        font: fontParam || tanka.font,
        background: bgParam || tanka.background,
      });
    }
  }, [tanka.background, tanka.font, tanka.text]);

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-3 sm:px-4">
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            fontFamily: '"Shippori Mincho", serif',
          },
        }}
      />
      <div className="relative">
        <TankaDisplay tanka={tanka} containerRef={containerRef} />
        {isGenerating && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-2 text-gray-700 font-medium">画像を生成中...</p>
            </div>
          </div>
        )}
      </div>
      <Controls
        tanka={tanka}
        onTankaChange={setTanka}
        onDownload={handleDownload}
        onShare={handleShare}
        isGenerating={isGenerating}
      />
    </div>
  );
}

export default App;