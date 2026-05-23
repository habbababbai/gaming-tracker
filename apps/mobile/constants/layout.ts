import { radii, spacing } from './spacing';

/** Phone-only layout tokens. No tablet breakpoints. */
export const layout = {
  screenPadding: spacing.md,
  sectionGap: spacing.md,
  stackGapSm: spacing.sm,
  input: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.sm,
  },
  cover: {
    borderRadius: radii.md,
    aspectRatio: 3 / 4,
  },
  list: {
    padding: spacing.md,
    rowGap: spacing.sm,
  },
  notFound: {
    gap: spacing.sm + spacing.xs,
  },
} as const;
