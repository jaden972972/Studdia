"use client";
import { useState, useEffect } from "react";

export default function Home() {
  // --- ESTADOS DE NAVEGACIÓN Y CONTENIDO ---
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [verDescripcion, setVerDescripcion] = useState(false);
  
  // --- ESTADOS DE YOUTUBE (Mantenlos igual) ---
  const [videoId, setVideoId] = useState("IlU-zDU6aQ0"); 
  const [input, setInput] = useState(""); 
  const [resultados, setResultados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [favoritos, setFavoritos] = useState<{id: string, nombre: string}[]>([]);
  const API_KEY = "AIzaSyCtV90pZuRZva5XyGkBYle_bd8t_bwLqzk"; 

  // --- PERSISTENCIA (Biblioteca) ---
  useEffect(() => {
    const data = localStorage.getItem("focusify_v4");
    if (data) setFavoritos(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem("focusify_v4", JSON.stringify(favoritos));
  }, [favoritos]);

  // --- FUNCIONES (Mantenlas igual) ---
  const buscarEnYoutube = async (query: string) => {
    if (!query) return;
    setCargando(true);
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${query}&type=video&key=${API_KEY}`);
      const data = await res.json();
      setResultados(data.items || []);
    } catch (e) { console.error(e); }
    setCargando(false);
  };

  const [segundos, setSegundos] = useState(25 * 60);
  const [activo, setActivo] = useState(false);
  const formatearTiempo = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`;

  return (
    <main className="flex min-h-screen bg-[#030303] text-white font-sans overflow-hidden">
      
      {/* ☰ BOTÓN MENÚ */}
      <button 
        onClick={() => setMenuAbierto(true)}
        className="fixed top-6 left-6 z-50 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
      </button>

      {/* 📱 SIDEBAR (MENÚ DESPLEGABLE) */}
      <div className={`fixed inset-y-0 left-0 z-[60] w-80 bg-[#0a0a0a] border-r border-white/10 p-8 transform transition-transform duration-500 ease-in-out ${menuAbierto ? "translate-x-0" : "-translate-x-full"}`}>
        <button onClick={() => setMenuAbierto(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white">✕</button>
        
        <h3 className="text-xs font-black text-red-600 tracking-widest mb-10 uppercase italic">Focusify Menu</h3>

        <div className="flex flex-col gap-8">
          {/* SECCIÓN BIBLIOTECA */}
          <div>
            <p className="text-[10px] text-gray-500 font-bold mb-4 uppercase tracking-widest">Mi Biblioteca</p>
            <div className="flex flex-col gap-2">
              {favoritos.length === 0 && <p className="text-xs text-gray-600">No hay canciones guardadas.</p>}
              {favoritos.map((f, i) => (
                <button 
                  key={i} 
                  onClick={() => { setVideoId(f.id); setMenuAbierto(false); }}
                  className="text-left text-sm py-2 px-4 rounded-xl bg-white/5 border border-transparent hover:border-red-600 transition-all truncate"
                >
                  🎵 {f.nombre}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-white/5" />

          {/* SECCIÓN INFO */}
          <button 
            onClick={() => { setVerDescripcion(true); setMenuAbierto(false); }}
            className="text-left text-sm font-bold text-gray-400 hover:text-white transition-colors"
          >
            📄 Sobre el Proyecto (SaaS)
          </button>
        </div>
      </div>

      {/* 🌑 OVERLAY (Cierra el menú al hacer clic fuera) */}
      {menuAbierto && <div onClick={() => setMenuAbierto(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] transition-opacity" />}

      {/* 📄 MODAL DESCRIPCIÓN SAAS */}
      {verDescripcion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#111] border border-white/10 p-10 rounded-[3rem] max-w-xl relative">
            <button onClick={() => setVerDescripcion(false)} className="absolute top-6 right-8 text-gray-500 hover:text-white">Cerrar</button>
            <h2 className="text-3xl font-black mb-4">FOCUSIFY<span className="text-red-600">.</span></h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Focusify es una herramienta de **Deep Work** diseñada para eliminar la fricción entre la procrastinación y el enfoque. Combina la técnica **Pomodoro** con una integración directa de la **API de YouTube**, permitiendo al usuario gestionar su entorno sonoro sin abandonar su flujo de trabajo. 
              <br /><br />
              Este SaaS utiliza **Next.js 14**, **Tailwind CSS** para una interfaz minimalista y **LocalStorage** para la persistencia de datos del lado del cliente.
            </p>
            <div className="flex gap-4">
              <span className="text-[10px] font-bold bg-red-600/20 text-red-500 px-3 py-1 rounded-full uppercase">React 18</span>
              <span className="text-[10px] font-bold bg-blue-600/20 text-blue-500 px-3 py-1 rounded-full uppercase">YouTube API v3</span>
            </div>
          </div>
        </div>
      )}

      {/* 🏗️ CONTENIDO PRINCIPAL (Tu app actual) */}
      <div className="flex-1 flex flex-col items-center p-10 overflow-y-auto">
        {/* PANEL POMODORO */}
        <div className="mb-8 bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] flex flex-col items-center w-full max-w-xs shadow-2xl">
          <h2 className="text-6xl font-mono font-black mb-4 tabular-nums">{formatearTiempo(segundos)}</h2>
          <button onClick={() => setActivo(!activo)} className="w-full py-3 rounded-2xl font-black bg-white text-black text-xs uppercase tracking-widest active:scale-95 transition-all">
            {activo ? "PAUSAR" : "PLUS ULTRA"}
          </button>
        </div>

        {/* BUSCADOR */}
        <div className="w-full max-w-2xl mb-10">
          <div className="flex gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
            <input 
              type="text" placeholder="Busca tu sonido de enfoque..." 
              className="bg-transparent flex-1 px-4 py-2 outline-none text-sm"
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarEnYoutube(input)}
            />
            <button onClick={() => buscarEnYoutube(input)} className="bg-red-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase">
              {cargando ? "..." : "BUSCAR"}
            </button>
          </div>

          {/* RESULTADOS */}
          {resultados.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 bg-black/60 p-5 rounded-[2rem] border border-white/10 animate-in slide-in-from-top-4 duration-500">
              {resultados.map((item) => (
                <div key={item.id.videoId} onClick={() => { setVideoId(item.id.videoId); setResultados([]); }} className="group cursor-pointer">
                  <div className="aspect-video overflow-hidden rounded-xl border border-white/10 group-hover:border-red-600 transition-all">
                    <img src={item.snippet.thumbnails.medium.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* REPRODUCTOR */}
        <div className="w-full max-w-5xl aspect-video rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-black">
          <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} allowFullScreen></iframe>
        </div>
      </div>
    </main>
  );
}