export const en = {
  search: {
    placeholder: 'Search games...',
    minChars: 'Type at least 2 characters',
    noResults: 'No games found',
    error: 'Something went wrong',
  },
  game: {
    notFound: 'Game not found',
  },
  notFound: {
    title: 'Not found',
    message: 'This screen does not exist.',
    goHome: 'Go home',
  },
  screens: {
    search: 'Search',
    game: 'Game',
  },
} as const;

export type TranslationKeys = typeof en;
