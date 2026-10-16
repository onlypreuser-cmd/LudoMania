import React from 'react';
import { BambooPandaSkin } from './BambooPandaSkin';
import { SkinComponentProps } from '../types';

/**
 * Re-export the rebuilt Bamboo Panda figurine for PandaSkin to ensure 100% fidelity.
 */
export const PandaSkin: React.FC<SkinComponentProps> = React.memo((props) => {
  return <BambooPandaSkin {...props} />;
});
PandaSkin.displayName = 'PandaSkin';
