import { PlayerColor } from '../../../types/game';

export interface SkinComponentProps {
  color: PlayerColor;
  isSelected?: boolean;
  isSelectable?: boolean;
}
