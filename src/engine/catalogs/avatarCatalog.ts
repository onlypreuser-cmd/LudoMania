import { AvatarOption } from '../../types/game';

/**
 * Cropped PNG Avatars from the user-provided 6-avatar sheet
 */
export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'avatar-1',
    name: 'Leo',
    src: '/assets/avatars/avatar-1.png',
    accent: 'from-blue-400 to-blue-600',
  },
  {
    id: 'avatar-2',
    name: 'Mia',
    src: '/assets/avatars/avatar-2.png',
    accent: 'from-pink-400 to-rose-500',
  },
  {
    id: 'avatar-3',
    name: 'Kai',
    src: '/assets/avatars/avatar-3.png',
    accent: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'avatar-4',
    name: 'Shiba',
    src: '/assets/avatars/avatar-4.png',
    accent: 'from-amber-400 to-orange-500',
  },
  {
    id: 'avatar-5',
    name: 'Mochi',
    src: '/assets/avatars/avatar-5.png',
    accent: 'from-pink-300 to-pink-500',
  },
  {
    id: 'avatar-6',
    name: 'Nova Bot',
    src: '/assets/avatars/avatar-6.png',
    accent: 'from-cyan-400 to-sky-600',
  },
];
