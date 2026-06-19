export interface Collection {
  id: string
  name: string
  description: string | null
  created_at: string
  entry_count?: number
  cover_image?: string | null
}

export interface Entry {
  id: string
  collection_id: string
  title: string | null
  prompt: string
  created_at: string
  images?: EntryImage[]
}

export interface EntryImage {
  id: string
  entry_id: string
  image_data: string  // base64 WebP data URL
  created_at: string
}

export interface Novel {
  id: string
  title: string
  description: string | null
  created_at: string
  context_count?: number
  part_count?: number
}

export interface NovelContext {
  id: string
  novel_id: string
  title: string | null
  content: string
  part_ids?: string[] | null
  order_num: number
  created_at: string
}

export interface NovelPart {
  id: string
  novel_id: string
  title: string
  content: string
  summary?: string | null
  order_num: number
  created_at: string
}

export interface ImageAlbum {
  id: string
  name: string
  description: string | null
  created_at: string
  image_count?: number
  cover_image?: string | null
}

export interface AlbumImage {
  id: string
  album_id: string
  image_data: string
  name: string | null
  created_at: string
}
