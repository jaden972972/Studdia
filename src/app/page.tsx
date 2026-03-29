"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [videoId, setVideoId] = useState("jfKfPfyJRdk"); 
  const [input, setInput] = useState(""); 
  const [nombreInput, setNombreInput] = useState(""); 
  const [favoritos, setFavoritos] = useState<{id: string, nombre: string}[]>([]);

  // --- LÓGICA POMODORO PLUS ULTRA ---
  const [segundos, setSegundos] = useState(25 * 60);
  const [activo, setActivo] = useState(false);
  const [modo, setModo] = useState<"TRABAJO" | "CORTO" | "LARGO">("TRABAJO");

  const formatearTiempo = (s: number) => {
    const min = Math.floor(s / 60);
    const seg = s % 60;
    return `${min}:${seg < 10 ? "0" : ""}${seg}`;
  };

  // Efecto para el cronómetro y el título de la pestaña
  useEffect(() => {
    let intervalo: any = null;
    
    if (activo && segundos > 0) {
      intervalo = setInterval(() => setSegundos((s) => s - 1), 1000);
      document.title = `(${formatearTiempo(segundos)}) Focusify`;
    } else if (segundos === 0) {
      setActivo(false);
      document.title = "¡TIEMPO CUMPLIDO!";
      alert("¡Sesión terminada! Tómate un respiro.");
    } else {
      document.title = "Focusify .";
    }

    return () => clearInterval(intervalo);
  }, [activo, segundos]);

  const cambiarModo = (nuevoModo: "TRABAJO" | "CORTO" | "LARGO", tiempo: number) => {
    setModo(nuevoModo);
    setSegundos(tiempo * 60);
    setActivo(false);
  };

  // --- MEMORIA LOCAL ---
  useEffect(() => {
    const guardados = localStorage.getItem("focusify_plus_ultra");
    if (guardados) {
      try { setFavoritos(JSON.parse(guardados)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (favoritos.length > 0) {
      localStorage.setItem("focusify_plus_ultra", JSON.stringify(favoritos));
    }
  }, [favoritos]);

  const cargarVideo = (url: string) => {
    const id = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url;
    if (id) setVideoId(id);
  };

  return (
    <main className={`flex min-h-screen flex-col items-center transition-colors duration-1000 p-4 md:p-10 font-sans relative overflow-x-hidden ${
      modo === "TRABAJO" ? "bg-[#030303]" : modo === "CORTO" ? "bg-[#051510]" : "bg-[#0a0a1a]"
    }`}>
      
      {/* DECORACIÓN DE FONDO */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 pointer-events-none"></div>
      
      <div className="relative w-full max-w-5xl flex flex-col items-center z-10">
        
        {/* 1. POMODORO PANEL */}
        <div className="relative z-20 mb-8 bg-white/[0.03] border border-white/10 backdrop-blur-xl p-5 rounded-[2.5rem] flex flex-col items-center shadow-2xl w-full max-w-xs transition-transform hover:scale-[1.02]">
          <div className="flex gap-2 mb-4">
            <button onClick={() => cambiarModo("TRABAJO", 25)} className={`text-[10px] px-4 py-1.5 rounded-full border transition-all font-bold ${modo === "TRABAJO" ? "bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]" : "border-white/10 text-gray-500"}`}>FOCUS</button>
            <button onClick={() => cambiarModo("CORTO", 5)} className={`text-[10px] px-4 py-1.5 rounded-full border transition-all font-bold ${modo === "CORTO" ? "bg-green-600 border-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]" : "border-white/10 text-gray-500"}`}>REST</button>
            <button onClick={() => cambiarModo("LARGO", 15)} className={`text-[10px] px-4 py-1.5 rounded-full border transition-all font-bold ${modo === "LARGO" ? "bg-blue-600 border-blue-600 text-white shadow-[0_0_15_rgba(37,99,235,0.4)]" : "border-white/10 text-gray-500"}`}>BREAK</button>
          </div>
          <h2 className="text-6xl font-mono font-black tracking-tighter mb-4 text-white tabular-nums">
            {formatearTiempo(segundos)}
          </h2>
          <button 
            onClick={() => setActivo(!activo)}
            className={`w-full py-3 rounded-2xl font-black text-xs transition-all active:scale-95 ${activo ? "bg-white/10 text-white border border-white/20" : "bg-white text-black shadow-lg"}`}
          >
            {activo ? "PAUSAR" : "INICIAR SESIÓN"}
          </button>
        </div>

        {/* 2. CABECERA MINI */}
        <h1 className="text-4xl md:text-5xl font-black text-white/10 tracking-tighter mb-8 italic select-none">
          FOCUSIFY<span className="text-red-600">.</span>
        </h1>

        {/* 3. REPRODUCTOR */}
        <div className="w-full aspect-video rounded-3xl overflow-hidden border-2 border-white/5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] bg-black mb-8 relative">
          <iframe 
            className="w-full h-full" 
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`} 
            allow="autoplay; encrypted-media" 
            allowFullScreen
          ></iframe>
        </div>

        {/* 4. CONTROLES DE VÍDEO */}
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-3 mb-10 bg-white/[0.02] p-4 rounded-3xl border border-white/5">
          <input 
            type="text" 
            placeholder="URL de YouTube..." 
            value={input} 
            className="bg-white/5 px-5 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-red-600/50 transition-all"
            onChange={(e) => setInput(e.target.value)} 
          />
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nombre..." 
              value={nombreInput} 
              className="bg-white/5 px-5 py-3 rounded-xl text-sm outline-none flex-1 focus:ring-1 focus:ring-green-600/50 transition-all"
              onChange={(e) => setNombreInput(e.target.value)} 
            />
            <button 
              onClick={() => { 
                cargarVideo(input); 
                if(nombreInput && input) setFavoritos([...favoritos, {id: input, nombre: nombreInput}]); 
                setInput(""); setNombreInput(""); 
              }} 
              className="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
            >
              ADD
            </button>
          </div>
        </div>

        {/* 5. BIBLIOTECA RESPONSIVE */}
        <div className="w-full px-2">
          <p className="text-center text-[10px] font-bold text-gray-600 uppercase tracking-[0.5em] mb-6">Tu Estación de Control</p>
          <div className="flex flex-wrap justify-center gap-3">
            {favoritos.map((f, i) => (
              <button 
                key={i} 
                onClick={() => cargarVideo(f.id)} 
                className="text-[10px] bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5 hover:border-red-600/50 hover:bg-red-600/5 transition-all uppercase font-bold tracking-wider"
              >
                {f.nombre}
              </button>
            ))}
            {favoritos.length > 0 && (
              <button 
                onClick={() => { if(confirm("¿Limpiar todo?")) { setFavoritos([]); localStorage.removeItem("focusify_plus_ultra"); }}}
                className="text-[10px] text-red-900 hover:text-red-500 transition-colors font-bold px-4 py-2"
              >
                × BORRAR
              </button>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}