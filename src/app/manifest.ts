import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ابزار انتخاب واحد',
    short_name: 'انتخاب واحد',
    description: 'مدیریت واحد و کمک به برنامه‌ریزی دروس دانشگاهی',
    start_url: '/',
    display: 'standalone',
    background_color: '#050507',
    theme_color: '#1877f2',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
  }
}