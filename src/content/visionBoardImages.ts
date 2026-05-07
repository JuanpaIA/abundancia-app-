import { ManifestationArea } from '../types'

export interface VisionImage {
  id: string
  url: string
  label: string
  fallbackEmoji: string
  fallbackColor: string
}

export const VISION_IMAGES: Record<ManifestationArea, VisionImage[]> = {
  dinero: [
    { id: 'd1', url: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&w=500', label: 'Abundancia', fallbackEmoji: '💰', fallbackColor: '#1A2A1A' },
    { id: 'd2', url: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&w=500', label: 'Libertad', fallbackEmoji: '🚗', fallbackColor: '#1A1A2A' },
    { id: 'd3', url: 'https://images.pexels.com/photos/323772/pexels-photo-323772.jpeg?auto=compress&w=500', label: 'Mi hogar', fallbackEmoji: '🏡', fallbackColor: '#2A1A1A' },
    { id: 'd4', url: 'https://images.pexels.com/photos/210600/pexels-photo-210600.jpeg?auto=compress&w=500', label: 'Viajes', fallbackEmoji: '✈️', fallbackColor: '#1A2A2A' },
    { id: 'd5', url: 'https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?auto=compress&w=500', label: 'Éxito', fallbackEmoji: '🌟', fallbackColor: '#2A2A1A' },
    { id: 'd6', url: 'https://images.pexels.com/photos/3760072/pexels-photo-3760072.jpeg?auto=compress&w=500', label: 'Crecimiento', fallbackEmoji: '📈', fallbackColor: '#1A2A1A' },
    { id: 'd7', url: 'https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&w=500', label: 'Prosperidad', fallbackEmoji: '💼', fallbackColor: '#2A1A2A' },
    { id: 'd8', url: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&w=500', label: 'Explorar', fallbackEmoji: '🗺️', fallbackColor: '#1A1A2A' },
  ],
  amor: [
    { id: 'a1', url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&w=500', label: 'Amor verdadero', fallbackEmoji: '💑', fallbackColor: '#2A1A1A' },
    { id: 'a2', url: 'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg?auto=compress&w=500', label: 'Romance', fallbackEmoji: '🌹', fallbackColor: '#2A1015' },
    { id: 'a3', url: 'https://images.pexels.com/photos/3014019/pexels-photo-3014019.jpeg?auto=compress&w=500', label: 'Conexión', fallbackEmoji: '❤️', fallbackColor: '#2A1A18' },
    { id: 'a4', url: 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&w=500', label: 'Corazón', fallbackEmoji: '💞', fallbackColor: '#2A0A10' },
    { id: 'a5', url: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&w=500', label: 'Unión', fallbackEmoji: '💍', fallbackColor: '#1A1A20' },
    { id: 'a6', url: 'https://images.pexels.com/photos/573299/pexels-photo-573299.jpeg?auto=compress&w=500', label: 'Familia', fallbackEmoji: '👨‍👩‍👧', fallbackColor: '#1A2A1A' },
    { id: 'a7', url: 'https://images.pexels.com/photos/1702373/pexels-photo-1702373.jpeg?auto=compress&w=500', label: 'Complicidad', fallbackEmoji: '🤝', fallbackColor: '#201A1A' },
    { id: 'a8', url: 'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&w=500', label: 'Pasión', fallbackEmoji: '🔥', fallbackColor: '#2A1208' },
  ],
  salud: [
    { id: 's1', url: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&w=500', label: 'Vitalidad', fallbackEmoji: '🏃', fallbackColor: '#0A2A1A' },
    { id: 's2', url: 'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&w=500', label: 'Equilibrio', fallbackEmoji: '🧘', fallbackColor: '#1A2A20' },
    { id: 's3', url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&w=500', label: 'Nutrición', fallbackEmoji: '🥗', fallbackColor: '#0A2010' },
    { id: 's4', url: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&w=500', label: 'Fuerza', fallbackEmoji: '💪', fallbackColor: '#1A1A2A' },
    { id: 's5', url: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&w=500', label: 'Paz interior', fallbackEmoji: '🌿', fallbackColor: '#102A10' },
    { id: 's6', url: 'https://images.pexels.com/photos/936094/pexels-photo-936094.jpeg?auto=compress&w=500', label: 'Naturaleza', fallbackEmoji: '🌲', fallbackColor: '#0A1A0A' },
    { id: 's7', url: 'https://images.pexels.com/photos/4720326/pexels-photo-4720326.jpeg?auto=compress&w=500', label: 'Energía', fallbackEmoji: '⚡', fallbackColor: '#1A2A1A' },
    { id: 's8', url: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&w=500', label: 'Bienestar', fallbackEmoji: '🌱', fallbackColor: '#0A2015' },
  ],
  proposito: [
    { id: 'p1', url: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&w=500', label: 'Impacto', fallbackEmoji: '🎤', fallbackColor: '#1A1A2A' },
    { id: 'p2', url: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&w=500', label: 'Equipo', fallbackEmoji: '🤝', fallbackColor: '#1A2A2A' },
    { id: 'p3', url: 'https://images.pexels.com/photos/313690/pexels-photo-313690.jpeg?auto=compress&w=500', label: 'Logro', fallbackEmoji: '🏆', fallbackColor: '#2A2A0A' },
    { id: 'p4', url: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&w=500', label: 'Visión', fallbackEmoji: '🚀', fallbackColor: '#0A0A2A' },
    { id: 'p5', url: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&w=500', label: 'Creación', fallbackEmoji: '💡', fallbackColor: '#1A1A20' },
    { id: 'p6', url: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&w=500', label: 'Liderazgo', fallbackEmoji: '👑', fallbackColor: '#201A10' },
    { id: 'p7', url: 'https://images.pexels.com/photos/1367269/pexels-photo-1367269.jpeg?auto=compress&w=500', label: 'Legado', fallbackEmoji: '✨', fallbackColor: '#1A2A1A' },
    { id: 'p8', url: 'https://images.pexels.com/photos/7414284/pexels-photo-7414284.jpeg?auto=compress&w=500', label: 'Crecimiento', fallbackEmoji: '🎓', fallbackColor: '#1A1A28' },
  ],
  felicidad: [
    { id: 'f1', url: 'https://images.pexels.com/photos/1448055/pexels-photo-1448055.jpeg?auto=compress&w=500', label: 'Alegría', fallbackEmoji: '😊', fallbackColor: '#2A2A0A' },
    { id: 'f2', url: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&w=500', label: 'Amistad', fallbackEmoji: '🤗', fallbackColor: '#2A1A10' },
    { id: 'f3', url: 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&w=500', label: 'Libertad', fallbackEmoji: '🌊', fallbackColor: '#0A1A2A' },
    { id: 'f4', url: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&w=500', label: 'Paz', fallbackEmoji: '🕊️', fallbackColor: '#1A2A2A' },
    { id: 'f5', url: 'https://images.pexels.com/photos/3807571/pexels-photo-3807571.jpeg?auto=compress&w=500', label: 'Celebración', fallbackEmoji: '🎉', fallbackColor: '#2A0A20' },
    { id: 'f6', url: 'https://images.pexels.com/photos/1028741/pexels-photo-1028741.jpeg?auto=compress&w=500', label: 'Plenitud', fallbackEmoji: '🌅', fallbackColor: '#2A1A0A' },
    { id: 'f7', url: 'https://images.pexels.com/photos/1741231/pexels-photo-1741231.jpeg?auto=compress&w=500', label: 'Bienestar', fallbackEmoji: '💛', fallbackColor: '#2A2A08' },
    { id: 'f8', url: 'https://images.pexels.com/photos/1382734/pexels-photo-1382734.jpeg?auto=compress&w=500', label: 'Gratitud', fallbackEmoji: '🙏', fallbackColor: '#1A1A10' },
  ],
}
