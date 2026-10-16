import appsData from './apps-directory.json';

export interface AppDirectoryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  learning_objectives: string;
  target_rules: string[];
  how_to_play: string;
  game_preview_image: string;
  launch_url: string;
  cefr_level: string;
  key_features: string[];
}

export const APPS_DIRECTORY: AppDirectoryItem[] = appsData as AppDirectoryItem[];

export function getAllApps(): AppDirectoryItem[] {
  return APPS_DIRECTORY;
}

export function getAppBySlug(slug: string): AppDirectoryItem | undefined {
  return APPS_DIRECTORY.find((app) => app.id === slug);
}

export function getAppsByCategory(category: string): AppDirectoryItem[] {
  if (!category || category === 'All') return APPS_DIRECTORY;
  return APPS_DIRECTORY.filter((app) => app.category === category);
}

export function getAllCategories(): string[] {
  const categories = new Set(APPS_DIRECTORY.map((app) => app.category));
  return ['All', ...Array.from(categories)];
}
