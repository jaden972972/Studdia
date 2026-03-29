"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [videoId, setVideoId] = useState("jfKfPfyJRdk"); 
  const [input, setInput] = useState(""); 
  const [nombreInput, setNombreInput] = useState(""); 
  const [favoritos, setFavoritos] = useState<{id: string, nombre: string}[]>([]);

  // --- MEMORIA INFINITA ---
  useEffect(() => {
    const guardados = localStorage.getItem("focusify_favs");
    if (guardados) {
      try {
        setFavoritos(JSON.parse(guardados));
      } catch (e) {
        console.error("Error al cargar favoritos");
      }
    }
  }, []);

  useEffect(() => {
    if (favoritos.length > 0) {
      localStorage.setItem("focusify_favs", JSON.stringify(favoritos));
    }
  }, [favoritos]);

  // MEJORA: cargarVideo ya NO borra el input, permite que se guarde después
  const cargarVideo = (url: string) => {
    const id = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url;
    if (id) {
      setVideoId(id);
      // setInput(""); <-- ELIMINADO para que no desaparezca al dar reproducir
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#030303] text-white p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5"></div>
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-red-900/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-green-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-7xl flex flex-col items-center z-10">
        
        {/* 1. CABECERA */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-red-600/10 blur-[60px] rounded-full"></div>
          <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 tracking-tighter mb-2 italic relative active:scale-95 transition-transform cursor-default">
            FOCUSIFY
            <span className="text-red-600">.</span>
          </h1>
          <p className="text-gray-500 font-medium tracking-[0.3em] uppercase text-xs backdrop-blur-sm bg-black/20 px-4 py-1 rounded-full border border-white/5 inline-block">
            No Ads • <span className="text-gray-400">Study In Peace</span>
          </p>
        </div>

        {/* 2. PANEL DE CONTROL */}
        <div className="mb-12 w-full max-w-3xl flex flex-col gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-lg shadow-[0_0_60px_-15px_rgba(0,0,0,0.7)] relative">
          
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Pega el link aquí..." 
              value={input}
              className="bg-white/[0.03] border border-white/5 px-5 py-4 rounded-xl flex-[2] focus:border-red-600/50 focus:ring-2 focus:ring-red-600/10 outline-none transition-all text-white placeholder:text-gray-700 font-mono text-sm"
              onChange={(e) => setInput(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Nombre de la canción..." 
              value={nombreInput}
              className="bg-white/[0.03] border border-white/5 px-5 py-4 rounded-xl flex-1 focus:border-green-600/50 focus:ring-2 focus:ring-green-600/10 outline-none transition-all text-white placeholder:text-gray-700 text-sm"
              onChange={(e) => setNombreInput(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => cargarVideo(input)}
              className="bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 flex-1 py-4 rounded-2xl font-bold transition-all active:scale-[0.97] active:brightness-90 shadow-[0_4px_20px_-2px_rgba(220,38,38,0.4)] text-sm uppercase tracking-wider"
            >
              REPRODUCIR
            </button>

            <button 
              onClick={() => {
                const id = input.includes("v=") ? input.split("v=")[1].split("&")[0] : (input || videoId);
                if (id && nombreInput) {
                  setFavoritos([...favoritos, { id, nombre: nombreInput }]);
                  // LIMPIEZA TOTAL AQUÍ
                  setNombreInput(""); 
                  setInput("");
                } else {
                  alert("Ponle un nombre antes de guardar.");
                }
              }}
              className="bg-gradient-to-b from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-white/5 flex-1 py-4 rounded-2xl font-bold transition-all active:scale-[0.97] shadow-xl text-sm uppercase tracking-wider text-green-400 group"
            >
              ⭐ <span className="group-hover:text-white transition-colors">GUARDAR Y LIMPIAR</span>
            </button>

            <button 
              onClick={() => {
                if (favoritos.length > 0) {
                  const random = favoritos[Math.floor(Math.random() * favoritos.length)];
                  setVideoId(random.id);
                  setInput(""); // Al hacer shuffle sí limpiamos para evitar confusiones
                  setNombreInput("");
                } else {
                  alert("Biblioteca vacía.");
                }
              }}
              className="bg-white/5 hover:bg-white/10 border border-white/10 flex-1 py-4 rounded-2xl font-bold transition-all active:scale-[0.97] shadow-xl text-sm uppercase tracking-wider text-gray-400 group"
            >
              🔀 <span className="group-hover:text-white transition-colors">Shuffle</span>
            </button>
          </div>
        </div>
        
        {/* 3. REPRODUCTOR */}
        <div className="w-full max-w-5xl aspect-video rounded-[32px] overflow-hidden border-4 border-[#090909] shadow-[0_0_100px_-10px_rgba(220,38,38,0.15),_inset_0_0_20px_1px_rgba(0,0,0,0.8)] bg-black p-1 relative">
          <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none"></div>
          <iframe
            className="w-full h-full rounded-[26px]"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0`}
            title="Focus Player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* 4. COLECCIÓN */}
        <div className="mt-16 w-full max-w-5xl">
          <div className="flex justify-between items-center mb-8 px-4">
             <h2 className="text-xl font-bold text-gray-600 uppercase tracking-[0.4em] text-center w-full relative">
               <span className="relative z-10 bg-[#030303] px-4">Tu Biblioteca</span>
               <div className="absolute left-0 right-0 top-1/2 h-px bg-white/5 z-0"></div>
             </h2>
          </div>
          
          {favoritos.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-2xl text-gray-700">
              <p className="text-4xl mb-3">🎧</p>
              <p className="text-sm font-bold">Sin música guardada</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {favoritos.map((fav, index) => (
                <button 
                  key={index}
                  onClick={() => { setVideoId(fav.id); setInput(""); setNombreInput(""); }}
                  className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl hover:bg-red-600/[0.03] hover:border-red-600/30 transition-all duration-300 text-left group relative overflow-hidden backdrop-blur-sm shadow-lg hover:shadow-red-600/10 hover:-translate-y-1"
                >
                  <p className="font-bold text-sm text-gray-400 group-hover:text-white truncate uppercase tracking-tight relative z-10">
                    {fav.nombre}
                  </p>
                  <p className="text-[10px] text-gray-700 font-mono mt-1 relative z-10 group-hover:text-red-300">{fav.id}</p>
                </button>
              ))}
            </div>
          )}

          {favoritos.length > 0 && (
             <div className="text-center mt-10">
               <button 
                 onClick={() => { if(confirm("¿Borrar todo?")) { setFavoritos([]); localStorage.removeItem("focusify_favs"); } }}
                 className="text-[10px] text-gray-800 hover:text-red-700 transition-colors uppercase font-bold tracking-widest bg-white/[0.01] px-4 py-1.5 rounded-full border border-white/5"
               >
                 Borrar biblioteca
               </button>
             </div>
          )}
        </div>

        {/* 5. PRESETS */}
        <div className="mt-20 mb-10 flex flex-wrap justify-center gap-8 py-4 px-8 border-t border-white/5 w-full max-w-3xl opacity-40 hover:opacity-100 transition-opacity duration-500">
          <button onClick={() => setVideoId("jfKfPfyJRdk")} className="hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-colors">Lofi Girl</button>
          <button onClick={() => setVideoId("5qap5aO4i9A")} className="hover:text-blue-400 text-xs font-bold uppercase tracking-widest transition-colors">Rainfall</button>
          <button onClick={() => setVideoId("DWcJFNfaw9c")} className="hover:text-orange-400 text-xs font-bold uppercase tracking-widest transition-colors">Fireplace</button>
        </div>

      </div>
    </main>
  );
}