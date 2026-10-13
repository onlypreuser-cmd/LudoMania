import { motion } from 'framer-motion';
import { Check, ChevronLeft, Lock, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { soundManager } from '../audio/soundManager';
import { TokenPreviewCanvas } from '../components/three/TokenPreviewCanvas';
import {
  BOARD_THEMES,
  COLOR_PALETTE,
  DICE_SKINS,
  TOKEN_SKINS,
} from '../engine/boardConfig';
import { useProfileStore } from '../store/useProfileStore';
import { PlayerColor } from '../types/game';

type CustomizeTab = 'tokens' | 'dice' | 'boards';

export const CustomizePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    coins,
    selectedTokenSkin,
    selectedDiceSkin,
    selectedBoardTheme,
    preferredColor,
    unlockedTokenSkins,
    unlockedDiceSkins,
    unlockedBoardThemes,
    setSelectedTokenSkin,
    setSelectedDiceSkin,
    setSelectedBoardTheme,
    unlockItem,
    updatePlayerConfig,
  } = useProfileStore();

  const [activeTab, setActiveTab] = useState<CustomizeTab>('tokens');
  const [tokenSeries, setTokenSeries] = useState<'hdr-1' | 'hdr-2' | 'classic'>(
    'hdr-1'
  );
  const [previewColor, setPreviewColor] = useState<PlayerColor>(
    preferredColor || 'blue'
  );
  const [toast, setToast] = useState<string>('');

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

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm">
            <span className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] flex items-center justify-center">
              ★
            </span>
            <span className="text-xs font-extrabold text-slate-800">
              {coins.toLocaleString()}
            </span>
          </div>
        </header>

        {/* Category Tabs: Tokens | Dice | Boards (Exact Reference Layout) */}
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

        {/* TAB 1: 3D TOKENS (17 Total: 9 New HDR Collector + 8 Classic Originals) */}
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
                          updatePlayerConfig(0, { color: c });
                        }}
                        className={`w-6 h-6 rounded-full ${
                          COLOR_PALETTE[c].bgClass
                        } border-2 border-white shadow transition-transform cursor-pointer ${
                          previewColor === c
                            ? 'scale-125 ring-2 ring-slate-800'
                            : 'opacity-65'
                        }`}
                      />
                    )
                  )}
                </div>
              </div>

              {/* Token Series Switcher (Keeps Active WebGL Canvases <= 8 for 60fps & Zero Context Loss) */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                {[
                  { id: 'hdr-1' as const, label: '✨ New HDR I (6)' },
                  { id: 'hdr-2' as const, label: '🔮 New HDR II (3)' },
                  { id: 'classic' as const, label: '👑 Classic (8)' },
                ].map((series) => {
                  const active = tokenSeries === series.id;
                  return (
                    <button
                      key={series.id}
                      type="button"
                      onClick={() => {
                        soundManager.play('ui_click');
                        setTokenSeries(series.id);
                      }}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-extrabold border transition-all cursor-pointer ${
                        active
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white/90 text-slate-600 border-slate-200 hover:bg-white'
                      }`}
                    >
                      {series.label}
                    </button>
                  );
                })}
              </div>

              {/* Grid of 3D Token Skins */}
              <div
                className={`grid ${
                  tokenSeries === 'classic'
                    ? 'grid-cols-2 sm:grid-cols-4'
                    : 'grid-cols-3'
                } gap-2.5 content-start`}
              >
                {visibleTokens.map((skin) => {
                  const isUnlocked = unlockedTokenSkins.includes(skin.id);
                  const isSelected = selectedTokenSkin === skin.id;

                  return (
                    <button
                      key={skin.id}
                      type="button"
                      onClick={() => {
                        if (isUnlocked) {
                          soundManager.play('ui_click');
                          setSelectedTokenSkin(skin.id);
                          showToast(
                            `Equipped ${skin.name} (${skin.moveStyleName})!`
                          );
                        } else {
                          const ok = unlockItem('token', skin.id, skin.price);
                          if (ok) {
                            soundManager.play('safe_star');
                            showToast(`Unlocked & Equipped ${skin.name}!`);
                          } else {
                            soundManager.play('timer_warn');
                            showToast(`Need ${skin.price} ★ coins to unlock!`);
                          }
                        }
                      }}
                      className={`relative rounded-[22px] p-2.5 flex flex-col items-center justify-between border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-sky-50 to-blue-100/90 border-blue-500 shadow-[0_8px_20px_rgba(37,99,235,0.2)] scale-[1.02]'
                          : 'bg-white border-white shadow-sm hover:border-slate-200'
                      }`}
                    >
                      {/* Top Right Check or Bottom Right Lock Badge */}
                      {isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow z-10">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}

                      {/* 3D Token Interactive Model Viewport */}
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/80 flex items-center justify-center overflow-hidden">
                        <TokenPreviewCanvas
                          skin={skin.id}
                          color={previewColor}
                          className="w-20 h-20"
                        />
                      </div>

                      <div className="mt-1.5 text-center w-full">
                        <span className="block text-xs font-extrabold text-slate-900 truncate">
                          {skin.name}
                        </span>
                        <span className="block text-[9px] font-bold text-blue-600 truncate">
                          {skin.moveStyleName}
                        </span>
                      </div>

                      {!isUnlocked && (
                        <div className="mt-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 flex items-center gap-1 text-[10px] font-extrabold text-amber-800">
                          <Lock className="w-2.5 h-2.5" />
                          <span>{skin.price}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Token Move Animation Callout */}
            <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-300 shrink-0" />
              <div className="text-xs">
                <p className="font-extrabold">
                  Active 3D Token:{' '}
                  {
                    TOKEN_SKINS.find((t) => t.id === selectedTokenSkin)?.name
                  }
                </p>
                <p className="text-blue-100 font-medium">
                  Board Hop Physics:{' '}
                  {
                    TOKEN_SKINS.find((t) => t.id === selectedTokenSkin)
                      ?.moveStyleName
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 3D DICE SKINS */}
        {activeTab === 'dice' && (
          <div className="mt-4 grid grid-cols-2 gap-3 flex-1 content-start">
            {DICE_SKINS.map((dice) => {
              const isUnlocked = unlockedDiceSkins.includes(dice.id);
              const isSelected = selectedDiceSkin === dice.id;

              return (
                <button
                  key={dice.id}
                  type="button"
                  onClick={() => {
                    if (isUnlocked) {
                      soundManager.play('ui_click');
                      setSelectedDiceSkin(dice.id);
                      showToast(`Equipped ${dice.name} 3D Dice!`);
                    } else {
                      const ok = unlockItem('dice', dice.id, dice.price);
                      if (ok) {
                        soundManager.play('safe_star');
                        showToast(`Unlocked & Equipped ${dice.name}!`);
                      } else {
                        soundManager.play('timer_warn');
                        showToast(`Need ${dice.price} ★ coins to unlock!`);
                      }
                    }
                  }}
                  className={`relative rounded-[24px] p-4 flex flex-col items-center gap-2 border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 border-blue-500 shadow-md'
                      : 'bg-white border-white shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}

                  {/* 3D Stylized Die Cube Preview */}
                  <div
                    className="w-16 h-16 rounded-2xl border-2 border-slate-200 shadow-lg grid grid-cols-2 gap-2 p-3 items-center justify-items-center"
                    style={{
                      backgroundColor: dice.bodyColor,
                      boxShadow: `0 10px 22px ${dice.edgeGlow}55`,
                    }}
                  >
                    {[0, 1, 2, 3].map((pip) => (
                      <span
                        key={pip}
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: dice.pipColor }}
                      />
                    ))}
                  </div>

                  <span className="text-sm font-extrabold text-slate-900">
                    {dice.name}
                  </span>

                  {!isUnlocked ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> {dice.price} ★
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-600">
                      {isSelected ? 'Equipped' : 'Tap to Equip'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 3: BOARD THEMES */}
        {activeTab === 'boards' && (
          <div className="mt-4 space-y-3 flex-1">
            {BOARD_THEMES.map((theme) => {
              const isUnlocked = unlockedBoardThemes.includes(theme.id);
              const isSelected = selectedBoardTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    if (isUnlocked) {
                      soundManager.play('ui_click');
                      setSelectedBoardTheme(theme.id);
                      showToast(`Equipped ${theme.name} Board!`);
                    } else {
                      const ok = unlockItem('board', theme.id, theme.price);
                      if (ok) {
                        soundManager.play('safe_star');
                        showToast(`Unlocked & Equipped ${theme.name}!`);
                      } else {
                        soundManager.play('timer_warn');
                        showToast(`Need ${theme.price} ★ coins to unlock!`);
                      }
                    }
                  }}
                  className={`w-full rounded-[24px] p-4 flex items-center justify-between border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 border-blue-500 shadow-md'
                      : 'bg-white border-white shadow-sm'
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
                    </div>
                  </div>

                  {!isUnlocked ? (
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold flex items-center gap-1 shrink-0">
                      <Lock className="w-3.5 h-3.5" /> {theme.price}
                    </span>
                  ) : isSelected ? (
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};
