import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import Novels from './pages/Novels'
import Novel from './pages/Novel'
import NovelReader from './pages/NovelReader'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collection/:id" element={<Collection />} />
        <Route path="/novels" element={<Novels />} />
        <Route path="/novel/:id" element={<Novel />} />
        <Route path="/novel/:id/read" element={<NovelReader />} />
      </Routes>
    </BrowserRouter>
  )
}
