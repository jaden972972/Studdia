"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [videoId, setVideoId] = useState("jfKfPfyJRdk"); 
  const [input, setInput] = useState(""); 
  const [nombreInput, setNombreInput] = useState(""); 
  const [favoritos, setFavoritos] = useState<{id: string, nombre: string}[]>([]);

  useEffect(() => {
    const guardados = localStorage.getItem("focusify_favs");
    if (guardados) {
      try { setFavoritos(JSON.parse(guardados)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (favoritos.length > 0) {
      localStorage.setItem("focusify_favs", JSON.stringify(favoritos));
    }
  }, [favoritos]);

  const cargarVideo = (url: string) => {
    const id = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url;
    if (id) setVideoId(id);
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#030303] text-white p-4 md:p-10 font-sans relative overflow-x-hidden">
      {/* DECORACIÓN */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5"></div>
      <div className="absolute -top-40 -left-40 w-60 h-60 bg-red-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative w-full max-w-7xl flex flex-col items-center z-10">
        
        {/* 1. CABECERA - Título mucho más pequeño en móvil */}
        <div className="text-center mb-8 md:mb-16 mt-4 md:mt-0">
          <h1 className="text-5xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 tracking-tighter mb-1 italic">
            FOCUSIFY<span className="text-red-600">.</span>
          </h1>
          <p className="text-gray-500 font-medium tracking-[0.2em] uppercase text-[9px] md:text-xs backdrop-blur-sm bg-black/20 px-3 py-1 rounded-full border border-white/5 inline-block">
            No Ads • Study In Peace
          </p>
        </div>

        {/* 2. PANEL DE CONTROL - Compacto */}
        <div className="mb-8 w-full max-w-2xl flex flex-col gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-lg shadow-2xl">
          <div className="flex flex-col md:flex-row gap-2">
            <input 
              type="text" 
              placeholder="Link de YouTube..." 
              value={input}
              className="bg-white/[0.03] border border-white/5 px-4 py-3 rounded-xl w-full md:flex-[2] focus:border-red-600/50 outline-none text-white text-sm"
              onChange={(e) => setInput(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Nombre..." 
              value={nombreInput}
              className="bg-white/[0.03] border border-white/5 px-4 py-3 rounded-xl w-full md:flex-1 focus:border-green-600/50 outline-none text-white text-sm"
              onChange={(e) => setNombreInput(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button 
              onClick={() => cargarVideo(input)}
              className="bg-red-600 hover:bg-red-500 py-3 rounded-xl font-bold transition-all active:scale-95 text-[10px] uppercase tracking-widest"
            >
              REPRODUCIR
            </button>
            <button 
              onClick={() => {
                const id = input.includes("v=") ? input.split("v=")[1].split("&")[0] : (input || videoId);
                if (id && nombreInput) {
                  setFavoritos([...favoritos, { id, nombre: nombreInput }]);
                  setNombreInput(""); setInput("");
                }
              }}
              className="bg-gray-800 hover:bg-gray-700 border border-white/5 py-3 rounded-xl font-bold transition-all active:scale-95 text-[10px] uppercase tracking-widest text-green-400"
            >
              ⭐ GUARDAR
            </button>
            <button 
              onClick={() => {
                if (favoritos.length > 0) {
                  const random = favoritos[Math.floor(Math.random() * favoritos.length)];
                  setVideoId(random.id);
                  setInput(""); setNombreInput("");
                }
              }}
              className="bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl font-bold transition-all active:scale-95 text-[10px] uppercase tracking-widest text-gray-400"
            >
              🔀 Shuffle
            </button>
          </div>
        </div>
        
        {/* 3. REPRODUCTOR */}
        <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden border-2 border-[#111] shadow-2xl bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
            title="Focus Player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* 4. BIBLIOTECA - Grid 1 columna en móvil */}
        <div className="mt-10 w-full max-w-4xl px-2">
          <h2 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em] text-center mb-6">
            Tu Biblioteca
          </h2>
          {favoritos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {favoritos.map((fav, index) => (
                <button 
                  key={index}
                  onClick={() => { setVideoId(fav.id); setInput(""); setNombreInput(""); }}
                  className="bg-white/[0.02] border border-white/5 p-4 rounded-xl hover:border-red-600/30 transition-all text-left group"
                >
                  <p className="font-bold text-xs text-gray-400 group-hover:text-white truncate uppercase">
                    {fav.nombre}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-800 text-[10px] italic">Biblioteca vacía</p>
          )}
        </div>

        {/* 5. PRESETS */}
        <div className="mt-12 mb-6 flex flex-wrap justify-center gap-4 py-4 border-t border-white/5 w-full max-w-2xl opacity-30">
          <button onClick={() => setVideoId("jfKfPfyJRdk")} className="hover:text-red-500 text-[9px] font-bold uppercase tracking-widest">Lofi</button>
          <button onClick={() => setVideoId("5qap5aO4i9A")} className="hover:text-blue-400 text-[9px] font-bold uppercase tracking-widest">Rain</button>
          <button onClick={() => setVideoId("DWcJFNfaw9c")} className="hover:text-orange-400 text-[9px] font-bold uppercase tracking-widest">Fire</button>
        </div>
      </div>
    </main>
  );
}