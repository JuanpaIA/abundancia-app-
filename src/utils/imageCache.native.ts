import { Paths, File, Directory } from 'expo-file-system'

function cacheDir(): Directory {
  return new Directory(Paths.cache, 'vision-board')
}

function cachedFile(id: string): File {
  return new File(cacheDir(), `${id}.jpg`)
}

export async function getCachedUri(
  id: string,
  storagePath: string,
  getSignedUrl: (path: string) => Promise<string | null>
): Promise<string | null> {
  try {
    const dir = cacheDir()
    if (!dir.exists) dir.create()

    const dest = cachedFile(id)
    if (dest.exists) return dest.uri

    const url = await getSignedUrl(storagePath)
    if (!url) return null

    const downloaded = await File.downloadFileAsync(url, dest)
    return downloaded.uri
  } catch {
    return null
  }
}

export async function cacheLocalFile(_id: string, sourceUri: string): Promise<string> {
  return sourceUri
}

export async function evictCachedFile(id: string): Promise<void> {
  try {
    const f = cachedFile(id)
    if (f.exists) f.delete()
  } catch {}
}
