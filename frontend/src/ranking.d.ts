/// <reference types="vite/client" />

// Ambient declarations for modules resolved from sibling ranking folder
declare module '../ranking/RankingComponent' {
  import { ComponentType } from 'react';
  const RankingComponent: ComponentType<Record<string, never>>;
  export default RankingComponent;
}
