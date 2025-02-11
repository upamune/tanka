import { Download, Share2, Twitter, Instagram, Copy, Image, ChevronDown, Link } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BACKGROUNDS } from '../constants';
import type { TankaData } from '../types';
import { FontSelect } from './FontSelect';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { type ChangeEvent, useState, useEffect, useRef } from 'react';

interface Props {
  tanka: TankaData;
  onTankaChange: (tanka: TankaData) => void;
  onDownload: () => void;
  onShare: () => void;
  isGenerating: boolean;
  onCopyImage: () => Promise<void>;
}

export const Controls = ({
  tanka,
  onTankaChange,
  onDownload,
  onShare,
  isGenerating,
  onCopyImage,
}: Props) => {
  const shareUrl = `${window.location.origin}${window.location.pathname}?${new URLSearchParams({
    text: tanka.text,
    font: tanka.font,
    bg: tanka.background,
  }).toString()}`;

  const [text, setText] = useState<string>(tanka.text);
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const imageMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(tanka.text);
  }, [tanka.text]);

  // クリックアウトサイドの処理を共通化
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (imageMenuRef.current && !imageMenuRef.current.contains(event.target as Node)) {
        setIsImageMenuOpen(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onTextChange = (newText: string) => {
    onTankaChange({ ...tanka, text: newText });
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    // 常にローカルのテキスト状態は更新する
    const newText = e.target.value;
    setText(newText);
    
    // IME入力中でない場合のみ親コンポーネントに通知
    if (!isComposing) {
      onTextChange(newText);
    }
  };

  const handleCompositionStart = () => {
    console.log('handleCompositionStart');
    setIsComposing(true);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    console.log('handleCompositionEnd');
    setIsComposing(false);
    // 日本語入力確定後に値を更新
    const newText = (e.target as HTMLTextAreaElement).value;
    setText(newText);
    onTextChange(newText);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="tanka-text" className="block text-sm font-medium text-gray-700 mb-2">
            短歌を入力
          </label>
          <textarea
            id="tanka-text"
            value={text}
            maxLength={50}
            onChange={handleChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            className="w-full h-40 p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 text-base sm:text-lg"
            placeholder="5-7-5-7-7の音数で
短歌を入力してください..."
          />
          <div className="mt-1 text-sm text-gray-500 text-right">
            {text.length}/50文字
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="font-select" className="block text-sm font-medium text-gray-700 mb-2">
              フォント選択
            </label>
            <FontSelect
              id="font-select"
              value={tanka.font}
              onChange={(font) => onTankaChange({ ...tanka, font })}
            />
          </div>

          <div>
            <label htmlFor="background-select" className="block text-sm font-medium text-gray-700 mb-2">
              背景選択
            </label>
            <fieldset id="background-select" aria-labelledby="background-select-label" className="flex gap-2">
              {BACKGROUNDS.map((bg) => (
                <button
                  type="button"
                  key={bg}
                  onClick={() => onTankaChange({ ...tanka, background: bg })}
                  className={`w-12 h-12 rounded-md ${bg} ${
                    tanka.background === bg ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  aria-label={`背景${bg}`}
                />
              ))}
            </fieldset>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Label htmlFor="writing-mode" className="text-sm font-medium">
            縦書き
          </Label>
          <Switch
            id="writing-mode"
            checked={tanka.isVertical}
            onCheckedChange={(checked) => {
              onTankaChange({ ...tanka, isVertical: checked });
            }}
          />
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
          <div className="relative" ref={imageMenuRef}>
            <button
              type="button"
              onClick={() => setIsImageMenuOpen(!isImageMenuOpen)}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base ${
                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Image size={20} />
                  <span>画像を作成</span>
                  <ChevronDown size={16} className={`transition-transform ${isImageMenuOpen ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {isImageMenuOpen && !isGenerating && (
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      onDownload();
                      setIsImageMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Download size={18} />
                    <span>保存</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await onCopyImage();
                        toast.success('画像をクリップボードにコピーしました');
                      } catch (error: unknown) {
                        console.error(error);
                        toast.error('画像のコピーに失敗しました');
                      }
                      setIsImageMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Copy size={18} />
                    <span>コピー</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={shareMenuRef}>
            <button
              type="button"
              onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm sm:text-base"
            >
              <Share2 size={20} />
              <span>共有</span>
              <ChevronDown size={16} className={`transition-transform ${isShareMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isShareMenuOpen && (
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      onShare();
                      setIsShareMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Link size={18} />
                    <span>URLをコピー</span>
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      tanka.text
                    )}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsShareMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Twitter size={18} />
                    <span>Twitterに投稿</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};