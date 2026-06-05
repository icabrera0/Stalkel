export function photoUrl(seedStr, size = 390) {
  return `https://picsum.photos/seed/${encodeURIComponent(String(seedStr))}/${size}/${size}`;
}
