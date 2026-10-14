import React from 'react';
import { TokenSkinId } from '../../../types/game';
import { AlienSkin } from './skins/AlienSkin';
import { AstronautSkin } from './skins/AstronautSkin';
import { AstronomerSkin } from './skins/AstronomerSkin';
import { BambooPandaSkin } from './skins/BambooPandaSkin';
import { CatSkin } from './skins/CatSkin';
import { ClassicSkin } from './skins/ClassicSkin';
import { CyberRobotSkin } from './skins/CyberRobotSkin';
import { DogSkin } from './skins/DogSkin';
import { FireDragonSkin } from './skins/FireDragonSkin';
import { IceDragonSkin } from './skins/IceDragonSkin';
import { KnightSkin } from './skins/KnightSkin';
import { MagicianSkin } from './skins/MagicianSkin';
import { PandaSkin } from './skins/PandaSkin';
import { PirateSkin } from './skins/PirateSkin';
import { RobotSkin } from './skins/RobotSkin';
import { StarUnicornSkin } from './skins/StarUnicornSkin';
import { UnicornSkin } from './skins/UnicornSkin';
import { SkinComponentProps } from './types';

export const TOKEN_SKIN_COMPONENTS: Record<TokenSkinId, React.FC<SkinComponentProps>> = {
  classic: ClassicSkin,
  knight: KnightSkin,
  dog: DogSkin,
  cat: CatSkin,
  panda: PandaSkin,
  robot: RobotSkin,
  astronaut: AstronautSkin,
  unicorn: UnicornSkin,
  'bamboo-panda': BambooPandaSkin,
  'cyber-robot': CyberRobotSkin,
  astronomer: AstronomerSkin,
  'star-unicorn': StarUnicornSkin,
  'fire-dragon': FireDragonSkin,
  'ice-dragon': IceDragonSkin,
  pirate: PirateSkin,
  magician: MagicianSkin,
  alien: AlienSkin,
};

export const RenderTokenSkin: React.FC<SkinComponentProps & { skin: TokenSkinId }> = React.memo(
  ({ skin, color, isSelected, isSelectable }) => {
    const Component = TOKEN_SKIN_COMPONENTS[skin] ?? ClassicSkin;
    return <Component color={color} isSelected={isSelected} isSelectable={isSelectable} />;
  }
);
RenderTokenSkin.displayName = 'RenderTokenSkin';
