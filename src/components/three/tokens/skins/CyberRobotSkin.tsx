import React from 'react';
import { RobotSkin } from './RobotSkin';
import { SkinComponentProps } from '../types';

/**
 * Re-export the rebuilt Robot figurine for CyberRobotSkin to ensure 100% fidelity.
 */
export const CyberRobotSkin: React.FC<SkinComponentProps> = React.memo((props) => {
  return <RobotSkin {...props} />;
});
CyberRobotSkin.displayName = 'CyberRobotSkin';
