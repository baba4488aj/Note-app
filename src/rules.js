export const MAX_PET_LEVEL=100;
export const TOWER_LEVEL_STEP=5;
export const GAME_VERSION='0.9.0';
export function levelGrowth(value){const level=Number.isFinite(value)?Math.max(1,Math.min(MAX_PET_LEVEL,Math.floor(value))):1,n=level-1;return {health:1+.14*n,attack:1+.12*n,recovery:1+.10*n,defense:.6*(1-Math.exp(-n/40))};}
