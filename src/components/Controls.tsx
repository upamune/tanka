import React from 'react';
import { Download, Share2, Instagram } from 'lucide-react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FONTS, BACKGROUNDS } from '../constants';
import { TankaData } from '../types';

interface Props {
  tanka: TankaData;
  onTankaChange: (tanka: TankaData) => void;
  onDownload: () => void;
  onShare: () => void;
  isGenerating: boolean;
}

export const Controls: React.FC<Props> = ({
  tanka,
  onTankaChange,
  onDownload,
  onShare,
  isGenerating,
}) => {
  const shareUrl = `${window.location.origin}${window.location.pathname}?${new URLSearchParams({
    text: tanka.text,
    font: tanka.font,
    bg: tanka.background,
  }).toString()}`;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            短歌を入力
          </label>
          <textarea
            value={tanka.text}
            onChange={(e) => onTankaChange({ ...tanka, text: e.target.value })}
            className="w-full h-32 p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 text-base sm:text-lg"
            placeholder="ここに短歌を入力してください..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              フォント選択
            </label>
            <select
              value={tanka.font}
              onChange={(e) => onTankaChange({ ...tanka, font: e.target.value })}
              className="w-full p-2 border rounded-md text-base sm:text-lg"
            >
              {FONTS.map((font) => (
                <option key={font.value} value={font.family} style={{ fontFamily: font.family }}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              背景選択
            </label>
            <div className="flex gap-2">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg}
                  onClick={() => onTankaChange({ ...tanka, background: bg })}
                  className={`w-12 h-12 rounded-md ${bg} ${
                    tanka.background === bg ? 'ring-2 ring-indigo-500' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center sm:justify-start">
          <button
            onClick={onDownload}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base ${
              isGenerating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Download size={20} />
            <span className="hidden sm:inline">
              {isGenerating ? '生成中...' : '画像保存'}
            </span>
          </button>
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm sm:text-base"
          >
            <Share2 size={20} />
            <span className="hidden sm:inline">共有</span>
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              tanka.text
            )}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm sm:text-base"
          >
            <X size={20} />
          </a>
          <button
            onClick={() => {
              toast.success('画像を保存して、Instagramアプリから共有してください');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 text-sm sm:text-base"
          >
            <Instagram size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};