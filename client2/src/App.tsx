// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Submit from "./pages/Submit";
import Reviews from "./pages/Reviews";
import Profile from "./pages/Profile";
import Review from "./pages/Review";
import { WalletProvider } from "./context/WalletContext"; // ✅ import wrapper
import "./index.css";

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        {/* Global Nav (sticky, translucent) */}
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/profile" element={<Profile />} />
          {/* dedicated review surface with PDF + Assistant */}
          <Route path="/review/:id" element={<Review />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}
