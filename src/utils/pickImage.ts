export interface PickedImage {
  uri: string
  mimeType: 'image/jpeg' | string
}

export async function pickImage(): Promise<PickedImage | null> {
  if (typeof document === 'undefined') return null

  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      const uri = URL.createObjectURL(file)
      resolve({ uri, mimeType: file.type || 'image/jpeg' })
    }

    // Safari doesn't fire 'cancel' — resolve null after focus returns without a file
    window.addEventListener('focus', function onFocus() {
      window.removeEventListener('focus', onFocus)
      setTimeout(() => { if (!input.files?.length) resolve(null) }, 400)
    }, { once: true })

    input.click()
  })
}
