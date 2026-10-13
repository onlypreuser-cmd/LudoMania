import { motion } from 'framer-motion';
import { Check, ChevronLeft, Dices, Eye, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { soundManager } from '../audio/soundManager';
import { SkinPickerModal } from '../components/modals/SkinPickerModal';
import {
  BOARD_THEMES,
  COLOR_PALETTE,
  DICE_SKINS,
  TOKEN_SKINS,
} from '../engine/boardConfig';
import { useProfileStore } from '../store/useProfileStore';
import { PlayerColor } from '../types/game';

type CustomizeTab = 'tokens' | 'dice' | 'boards';

const TOKEN_ICON_MAP: Record<string, string> = {
  classic: '♟️',
  knight: '🐴',
  dog: '🐶',
  cat: '🐱',
  panda: '🐼',
  robot: '🤖',
  astronaut: '🧑‍🚀',
  unicorn: '🦄',
  'bamboo-panda': '🎋',
  'cyber-robot': '🦾',
  astronomer: '🔭',
  'star-unicorn': '✨',
  'fire-dragon': '🐉',
  'ice-dragon': '❄️',
  pirate: '🏴‍☠️',
  magician: '🧙',
  alien: '👽',
};

export const CustomizePage: React.FC = () => {
  const navigate = useNavigate();
  const selectedTokenSkin = useProfileStore((s) => s.selectedTokenSkin);
  const selectedDiceSkin = useProfileStore((s) => s.selectedDiceSkin);
  const selectedBoardTheme = useProfileStore((s) => s.selectedBoardTheme);
  const preferredColor = useProfileStore((s) => s.preferredColor);
  const setSelectedTokenSkin = useProfileStore((s) => s.setSelectedTokenSkin);
  const setSelectedDiceSkin = useProfileStore((s) => s.setSelectedDiceSkin);
  const setSelectedBoardTheme = useProfileStore((s) => s.setSelectedBoardTheme);

  const [activeTab, setActiveTab] = useState<CustomizeTab>('tokens');
  const [tokenSeries, setTokenSeries] = useState<'hdr-1' | 'hdr-2' | 'classic'>(
    'hdr-1'
  );
  const [previewColor, setPreviewColor] = useState<PlayerColor>(
    preferredColor || 'blue'
  );
  const [toast, setToast] = useState<string>('');
  const [studioModal, setStudioModal] = useState<{
    isOpen: boolean;
    mode: 'token' | 'dice';
    skinId: string;
  } | null>(null);

  const visibleTokens = React.useMemo(() => {
    const newHdrPart1 = [
      'bamboo-panda',
      'cyber-robot',
      'astronomer',
      'star-unicorn',
      'fire-dragon',
      'ice-dragon',
    ];
    const newHdrPart2 = ['pirate', 'magician', 'alien'];
    if (tokenSeries === 'hdr-1') {
      return TOKEN_SKINS.filter((s) => newHdrPart1.includes(s.id));
    }
    if (tokenSeries === 'hdr-2') {
      return TOKEN_SKINS.filter((s) => newHdrPart2.includes(s.id));
    }
    return TOKEN_SKINS.filter(
      (s) => !newHdrPart1.includes(s.id) && !newHdrPart2.includes(s.id)
    );
  }, [tokenSeries]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 via-indigo-50 to-amber-50 flex items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[430px] min-h-screen sm:min-h-[840px] sm:rounded-[42px] bg-gradient-to-b from-[#f8faff] via-[#f3f6fc] to-[#eef2f9] sm:shadow-[0_28px_70px_rgba(15,23,42,0.28),inset_0_2px_4px_rgba(255,255,255,1)] sm:border-[6px] sm:border-white flex flex-col p-4 sm:p-5"
      >
        {/* Top Header */}
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              soundManager.play('ui_click');
              navigate('/');
            }}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:scale-105 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h1 className="text-xl font-extrabold text-slate-900 font-['Fredoka']">
            Customize
          </h1>

          <div className="w-10" />
        </header>

        {/* Category Tabs: Tokens | Dice | Boards */}
        <div className="mt-4 grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-200/75 border border-white">
          {(['tokens', 'dice', 'boards'] as CustomizeTab[]).map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  soundManager.play('ui_click');
                  setActiveTab(tab);
                }}
                className={`py-2 rounded-xl text-xs font-extrabold capitalize transition-all cursor-pointer ${
                  active
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Toast Feedback */}
        {toast && (
          <div className="mt-2.5 py-2 px-3 rounded-xl bg-slate-900 text-amber-300 text-xs font-extrabold text-center shadow">
            {toast}
          </div>
        )}

        {/* TAB 1: 3D TOKENS */}
        {activeTab === 'tokens' && (
          <div className="mt-3.5 flex-1 flex flex-col justify-between">
            <div>
              {/* Color Preview Bar */}
              <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/90 border border-slate-200/80 mb-2.5">
                <span className="text-xs font-extrabold text-slate-600">
                  Preview Pedestal Color:
                </span>
                <div className="flex items-center gap-2">
                  {(['blue', 'red', 'green', 'yellow'] as PlayerColor[]).map(
                    (c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          soundManager.play('ui_click');
                          setPreviewColor(c);
                        }}
                        className={`w-5 h-5 rounded-full ${
                          COLOR_PALETTE[c].bgClass
                        } border-2 border-white shadow transition-transform cursor-pointer ${
                          previewColor === c
                            ? 'scale-125 ring-2 ring-slate-800'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    )
                  )}
                </div>
              </div>

              {/* Sub-series Switcher */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/80 border border-slate-200 mb-3">
                {[
                  { id: 'hdr-1', label: 'Mythic PBR' },
                  { id: 'hdr-2', label: 'Cosmic / Sci-Fi' },
                  { id: 'classic', label: 'Original 8' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      soundManager.play('ui_click');
                      setTokenSeries(s.id as any);
                    }}
                    className={`py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                      tokenSeries === s.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Grid of Tokens - Lightweight 2D Cards (Zero WebGL Canvases on Page) */}
              <div
                className={`grid ${
                  tokenSeries === 'classic'
                    ? 'grid-cols-2 sm:grid-cols-4'
                    : 'grid-cols-3'
                } gap-2.5 content-start`}
              >
                {visibleTokens.map((skin) => {
                  const isSelected = selectedTokenSkin === skin.id;
                  const icon = TOKEN_ICON_MAP[skin.id] || '♟️';

                  return (
                    <button
                      key={skin.id}
                      type="button"
                      onClick={() => {
                        soundManager.play('ui_click');
                        setStudioModal({
                          isOpen: true,
                          mode: 'token',
                          skinId: skin.id,
                        });
                      }}
                      className={`relative rounded-[22px] p-2.5 flex flex-col items-center justify-between border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-sky-50 to-blue-100/90 border-blue-500 shadow-[0_8px_20px_rgba(37,99,235,0.2)] scale-[1.02]'
                          : 'bg-white border-white shadow-sm hover:border-slate-200 hover:shadow-md'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow z-10">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}

                      <div
                        className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-inner border border-slate-200/60"
                        style={{
                          background: `radial-gradient(circle at 50% 40%, ${COLOR_PALETTE[previewColor].primary}25 0%, #f1f5f9 85%)`,
                        }}
                      >
                        <span className="text-3xl select-none drop-shadow-md">
                          {icon}
                        </span>
                        <span className="mt-1 px-1.5 py-0.2 rounded-full bg-white/90 border border-slate-200 text-[9px] font-black text-slate-600 flex items-center gap-0.5 shadow-xs">
                          <Eye className="w-2.5 h-2.5 text-blue-600" />
                          <span>3D View</span>
                        </span>
                      </div>

                      <div className="mt-1.5 text-center w-full">
                        <span className="block text-xs font-extrabold text-slate-900 truncate">
                          {skin.name}
                        </span>
                        <span className="block text-[9px] font-bold text-blue-600 truncate">
                          {skin.moveStyleName}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Token Move Animation Callout */}
            <div
              onClick={() => {
                soundManager.play('ui_click');
                setStudioModal({
                  isOpen: true,
                  mode: 'token',
                  skinId: selectedTokenSkin,
                });
              }}
              className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md flex items-center justify-between cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-amber-300 shrink-0" />
                <div className="text-xs">
                  <p className="font-extrabold">
                    Active Token:{' '}
                    {
                      TOKEN_SKINS.find((t) => t.id === selectedTokenSkin)?.name
                    }
                  </p>
                  <p className="text-blue-100 font-medium">
                    Move Style:{' '}
                    {
                      TOKEN_SKINS.find((t) => t.id === selectedTokenSkin)
                        ?.moveStyleName
                    }
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-xl bg-white/20 text-white text-[11px] font-black flex items-center gap-1 border border-white/30 shrink-0">
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                <span>Open 3D Studio</span>
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: 3D DICE SKINS */}
        {activeTab === 'dice' && (
          <div className="mt-4 grid grid-cols-2 gap-3 flex-1 content-start">
            {DICE_SKINS.map((dice) => {
              const isSelected = selectedDiceSkin === dice.id;
              const shapeLabels: Record<string, string> = {
                'pillowed-cube': 'Pillowed Bone • Crown Ace',
                'chamfered-bullion': '45° Bullion • Star Pips',
                'cushion-gem': 'Faceted Gem • Crystal Pips',
                'sci-fi-datacube': 'Datacube • Digital Glyphs',
                'worn-seal': 'Dynasty Seal • Lotus Spirals',
                'monolith-glass': 'Monolith • Star Runes',
              };

              return (
                <button
                  key={dice.id}
                  type="button"
                  onClick={() => {
                    soundManager.play('ui_click');
                    setStudioModal({
                      isOpen: true,
                      mode: 'dice',
                      skinId: dice.id,
                    });
                  }}
                  className={`relative rounded-[24px] p-3.5 flex flex-col items-center gap-1.5 border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 border-blue-500 shadow-md'
                      : 'bg-white border-white shadow-sm hover:border-slate-200 hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}

                  <div
                    className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-inner border border-slate-200 relative overflow-hidden"
                    style={{ backgroundColor: dice.bodyColor }}
                  >
                    <span
                      className="text-2xl font-black drop-shadow-sm"
                      style={{ color: dice.pipColor }}
                    >
                      {dice.id === 'classic-white' ? '👑' : dice.id === 'royal-gold' ? '★' : dice.id === 'ruby-blaze' ? '◆' : dice.id === 'cyber-neon' ? '■' : dice.id === 'emerald-jade' ? '☯' : '✦'}
                    </span>
                    <span className="absolute bottom-1 px-1 py-0.2 rounded-full bg-black/40 text-[8px] font-black text-white flex items-center gap-0.5">
                      <Eye className="w-2 h-2 text-amber-300" />
                      <span>3D View</span>
                    </span>
                  </div>

                  <span className="text-sm font-extrabold text-slate-900 truncate w-full text-center">
                    {dice.name}
                  </span>

                  <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center">
                    {shapeLabels[dice.shapeType] || 'Physics Die'}
                  </span>

                  <span className="text-[11px] font-bold text-blue-600">
                    {isSelected ? 'Equipped (Tap to Inspect)' : 'Tap to Inspect & Equip'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 3: BOARD THEMES */}
        {activeTab === 'boards' && (
          <div className="mt-4 space-y-3 flex-1">
            {BOARD_THEMES.map((theme) => {
              const isSelected = selectedBoardTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    soundManager.play('ui_click');
                    setSelectedBoardTheme(theme.id);
                    showToast(`Equipped ${theme.name} Board!`);
                  }}
                  className={`w-full rounded-[24px] p-4 flex items-center justify-between border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 border-blue-500 shadow-md'
                      : 'bg-white border-white shadow-sm hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.bgGradient} border-2 border-slate-200 shadow-inner grid grid-cols-2 gap-1 p-1.5 shrink-0`}
                    >
                      <span className="rounded bg-blue-500" />
                      <span className="rounded bg-rose-500" />
                      <span className="rounded bg-amber-400" />
                      <span className="rounded bg-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {theme.name}
                      </h3>
                      <p className="text-xs font-medium text-slate-500">
                        {theme.description}
                      </p>
                      {/* Unique Board Perk Badge */}
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 text-[10px] font-black border border-amber-300/50">
                          {theme.perk.badge}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[190px]">
                          {theme.perk.description}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {/* Universal Dedicated 3D Studio Modal */}
        <SkinPickerModal
          isOpen={studioModal !== null}
          onClose={() => setStudioModal(null)}
          mode={studioModal?.mode || 'token'}
          initialSkinId={studioModal?.skinId}
          initialColor={previewColor}
        />
      </motion.div>
    </div>
  );
};

export default CustomizePage;
