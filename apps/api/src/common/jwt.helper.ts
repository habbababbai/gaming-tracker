export function getExpFromDecoded(decoded: unknown): number {
  if (
    decoded === null ||
    typeof decoded !== 'object' ||
    !('exp' in decoded) ||
    typeof (decoded as { exp: unknown }).exp !== 'number'
  ) {
    throw new Error('Invalid token payload');
  }
  return (decoded as { exp: number }).exp;
}
