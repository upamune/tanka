import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Toaster, toast } from 'react-hot-toast';
import { TankaDisplay } from './components/TankaDisplay';
import { Controls } from './components/Controls';
import type { TankaData } from './types';
import { FONTS, BACKGROUNDS } from './constants';

function App() {
  const [tanka, setTanka] = useState<TankaData>({
    text: '',
    font: FONTS[0].family,
    background: BACKGROUNDS[0],
    isVertical: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const updateTanka = (newTanka: TankaData) => {
    setTanka(newTanka);
    
    // Update URL parameters
    const params = new URLSearchParams();
    if (newTanka.text) params.set('text', newTanka.text);
    if (newTanka.font) params.set('font', newTanka.font);
    if (newTanka.background) params.set('bg', newTanka.background);
    params.set('vertical', String(newTanka.isVertical));
    
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  };

  const handleDownload = async () => {
    if (containerRef.current) {
      setIsGenerating(true);
      try {
        // フォントの読み込みを待つ
        await document.fonts.ready;
        
        // 使用中のフォントが確実に読み込まれるのを待つ
        const currentFont = new FontFace(tanka.font, `local(${tanka.font})`);
        try {
          await currentFont.load();
          document.fonts.add(currentFont);
        } catch (e) {
          console.warn('Font loading warning:', e);
          // フォントのロードに失敗しても続行（ローカルフォントの場合）
        }

        // DOMの更新とレンダリングを待つ
        await new Promise(resolve => setTimeout(resolve, 500));

        // 要素の実際のサイズを取得
        const rect = containerRef.current.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(containerRef.current);

        // スタイルをすべてコピー
        const styles = {} as Record<string, string>;
        for (const key of computedStyle) {
          styles[key] = computedStyle.getPropertyValue(key);
        }

        const dataUrl = await toPng(containerRef.current, {
          quality: 1.0,
          pixelRatio: 3,
          skipAutoScale: false,
          width: rect.width,
          height: rect.height,
          style: {
            ...styles,
            margin: '0',
            padding: computedStyle.padding,
            fontFamily: `"${tanka.font}", serif`,
            textRendering: 'optimizeLegibility',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          fontEmbedCSS: `
            @font-face {
              font-family: "${tanka.font}";
              src: local("${tanka.font}");
            }
          `,
          backgroundColor: '#ffffff',
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
    if (tanka.text) params.set('text', tanka.text);
    if (tanka.font) params.set('font', tanka.font);
    if (tanka.background) params.set('bg', tanka.background);
    params.set('vertical', String(tanka.isVertical));
    
    // 現在のパスを保持しつつ、クエリパラメータを更新
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success('共有用URLをコピーしました'));
  };

  // Load from URL params on mount and when URL changes
  React.useEffect(() => {
    const loadParamsFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const textParam = params.get('text');
      const fontParam = params.get('font');
      const bgParam = params.get('bg');
      const isVerticalParam = params.get('vertical');

      // フォントの検証
      const isValidFont = FONTS.some(font => font.family === fontParam);
      const validFont = isValidFont ? fontParam : FONTS[0].family;

      // 背景の検証
      const isValidBackground = BACKGROUNDS.includes(bgParam || '');
      const validBackground = isValidBackground ? bgParam : BACKGROUNDS[0];

      setTanka(current => ({
        text: textParam || current.text,
        font: validFont || current.font,
        background: validBackground || current.background,
        isVertical: isVerticalParam ? isVerticalParam === 'true' : current.isVertical,
      }));
    };

    // Initial load
    loadParamsFromUrl();

    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', loadParamsFromUrl);
    return () => window.removeEventListener('popstate', loadParamsFromUrl);
  }, []);

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
        onTankaChange={updateTanka}
        onDownload={handleDownload}
        onShare={handleShare}
        isGenerating={isGenerating}
      />
    </div>
  );
}

export default App;