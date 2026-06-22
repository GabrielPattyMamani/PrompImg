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
  config?: string | null
  created_at: string
  context_count?: number
  part_count?: number
  chapter_count?: number
}

export interface NovelContext {
  id: string
  novel_id: string
  title: string | null
  content: string
  compact?: string | null
  part_ids?: string[] | null
  order_num: number
  created_at: string
}

export interface NovelChapter {
  id: string
  novel_id: string
  title: string
  context?: string | null
  summary?: string | null
  order_num: number
  created_at: string
}

export interface NovelPart {
  id: string
  novel_id: string
  chapter_id?: string | null
  title: string
  content: string
  summary?: string | null
  draft?: string | null
  order_num: number
  created_at: string
}

export interface NovelPlace {
  id: string
  novel_id: string
  name: string
  description: string | null
  created_at: string
}

export interface NovelCharacter {
  id: string
  novel_id: string
  name: string
  description: string | null
  role: string | null
  appearance: string | null
  created_at: string
  place_ids?: string[]
}

export interface NovelCharacterPlace {
  id: string
  character_id: string
  place_id: string
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
