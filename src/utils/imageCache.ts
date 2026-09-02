// Web: no local filesystem. Return the signed URL directly — the browser's HTTP
// cache handles deduplication.

export async function getCachedUri(
  _id: string,
  storagePath: string,
  getSignedUrl: (path: string) => Promise<string | null>
): Promise<string | null> {
  return getSignedUrl(storagePath)
}

export async function cacheLocalFile(_id: string, sourceUri: string): Promise<string> {
  return sourceUri
}

export async function evictCachedFile(_id: string): Promise<void> {
  // no-op on web
}
