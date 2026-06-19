import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import Novels from './pages/Novels'
import Novel from './pages/Novel'
import NovelReader from './pages/NovelReader'
import NovelSummaries from './pages/NovelSummaries'
import Gallery from './pages/Gallery'
import AlbumPage from './pages/AlbumPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collection/:id" element={<Collection />} />
        <Route path="/novels" element={<Novels />} />
        <Route path="/novel/:id" element={<Novel />} />
        <Route path="/novel/:id/read" element={<NovelReader />} />
        <Route path="/novel/:id/summaries" element={<NovelSummaries />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/gallery/:id" element={<AlbumPage />} />
      </Routes>
    </BrowserRouter>
  )
}
