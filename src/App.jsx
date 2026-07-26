import { useState, useEffect, useRef } from "react";
import { toPng, toBlob } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Heart,
  Wind,
  Moon,
  Utensils,
  Calendar,
  Sparkles,
  PartyPopper,
  Sun,
  Copy,
  RefreshCw,
  Check,
  Download,
  Volume2,
  VolumeX,
} from "lucide-react";

// File lagu diambil dari folder public, bukan di-import lewat bundler -
// ini paling aman & konsisten antara dev dan build production (Vercel).
// Pindahkan file kamu ke: public/audio/fixyou.mp3
const SONG_URL = "/audio/fixyou.mp3";

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function fmt(n) {
  return Math.round(n).toLocaleString("id-ID");
}

function ageBreakdown(birth, now) {
  let y = now.getFullYear() - birth.getFullYear();
  let m = now.getMonth() - birth.getMonth();
  let d = now.getDate() - birth.getDate();
  if (d < 0) {
    m -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    d += prevMonth.getDate();
  }
  if (m < 0) {
    y -= 1;
    m += 12;
  }
  return { y, m, d };
}

function zodiak(month, day) {
  const z = [
    [1, 20, "Capricorn"],
    [2, 19, "Aquarius"],
    [3, 20, "Pisces"],
    [4, 20, "Aries"],
    [5, 21, "Taurus"],
    [6, 21, "Gemini"],
    [7, 22, "Cancer"],
    [8, 23, "Leo"],
    [9, 23, "Virgo"],
    [10, 23, "Libra"],
    [11, 22, "Scorpio"],
    [12, 22, "Sagittarius"],
    [12, 31, "Capricorn"],
  ];
  for (const [m, dd, name] of z) {
    if (month < m || (month === m && day <= dd)) return name;
  }
  return "Capricorn";
}

function generasi(year) {
  if (year >= 2013) return "Generasi Alpha";
  if (year >= 1997) return "Generasi Z";
  if (year >= 1981) return "Generasi Milenial";
  if (year >= 1965) return "Generasi X";
  if (year >= 1946) return "Baby Boomer";
  return "Generasi Senior";
}

function nextBirthdayCountdown(birth, now) {
  let next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < now)
    next = new Date(now.getFullYear() + 1, birth.getMonth(), birth.getDate());
  return Math.ceil((next - now) / 86400000);
}

function seedRandom(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return function () {
    h ^= h << 13;
    h >>>= 0;
    h ^= h >> 17;
    h ^= h << 5;
    h >>>= 0;
    return (h % 1000) / 1000;
  };
}

// Deterministic pseudo receipt/transaction number based on name + date,
// so the same input always "prints" the same struk number.
function strukNumber(seed) {
  const rnd = seedRandom(seed);
  let out = "";
  for (let i = 0; i < 8; i++) out += Math.floor(rnd() * 10);
  return out;
}

function computeStats(nama, tglVal) {
  const birth = new Date(tglVal + "T00:00:00");
  const now = new Date();
  const { y, m, d } = ageBreakdown(birth, now);
  const totalMs = now - birth;
  const totalDays = totalMs / 86400000;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;
  const totalWeeks = totalDays / 7;

  return {
    nama,
    lahirLabel: `${birth.getDate()} ${BULAN[birth.getMonth()]} ${birth.getFullYear()} (${HARI[birth.getDay()]})`,
    usiaLabel: `${y} th ${m} bln ${d} hr`,
    dicetakLabel: `${now.getDate()} ${BULAN[now.getMonth()]} ${now.getFullYear()}`,
    dicetakJam: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    generasi: generasi(birth.getFullYear()),
    noStruk: strukNumber(nama + tglVal),
    items: [
      {
        icon: Calendar,
        label: "Total hari hidup",
        value: `${fmt(totalDays)} hari`,
      },
      {
        icon: Heart,
        label: "Perkiraan detak jantung",
        value: `${fmt(totalMinutes * 80)} kali`,
      },
      {
        icon: Wind,
        label: "Perkiraan tarikan napas",
        value: `${fmt(totalMinutes * 16)} kali`,
      },
      {
        icon: Moon,
        label: "Waktu buat tidur",
        value: `${fmt((totalDays * 8) / 24 / 365)} tahun`,
      },
      {
        icon: Utensils,
        label: "Perkiraan jumlah makan",
        value: `${fmt(totalDays * 3)} kali`,
      },
      {
        icon: Sun,
        label: "Akhir pekan terlewati",
        value: `${fmt(Math.floor(totalWeeks) * 2)} hari`,
      },
      {
        icon: Sparkles,
        label: "Zodiak",
        value: zodiak(birth.getMonth() + 1, birth.getDate()),
      },
      {
        icon: PartyPopper,
        label: "Ultah berikutnya",
        value: `${nextBirthdayCountdown(birth, now)} hari lagi`,
      },
    ],
  };
}

const zigzagStyle = {
  clipPath:
    "polygon(0% 10px,3% 0%,6% 10px,9% 0%,12% 10px,15% 0%,18% 10px,21% 0%,24% 10px,27% 0%,30% 10px,33% 0%,36% 10px,39% 0%,42% 10px,45% 0%,48% 10px,51% 0%,54% 10px,57% 0%,60% 10px,63% 0%,66% 10px,69% 0%,72% 10px,75% 0%,78% 10px,81% 0%,84% 10px,87% 0%,90% 10px,93% 0%,96% 10px,99% 0%,100% 10px,100% calc(100% - 10px),97% 100%,94% calc(100% - 10px),91% 100%,88% calc(100% - 10px),85% 100%,82% calc(100% - 10px),79% 100%,76% calc(100% - 10px),73% 100%,70% calc(100% - 10px),67% 100%,64% calc(100% - 10px),61% 100%,58% calc(100% - 10px),55% 100%,52% calc(100% - 10px),49% 100%,46% calc(100% - 10px),43% 100%,40% calc(100% - 10px),37% 100%,34% calc(100% - 10px),31% 100%,28% calc(100% - 10px),25% 100%,22% calc(100% - 10px),19% 100%,16% calc(100% - 10px),13% 100%,10% calc(100% - 10px),7% 100%,4% calc(100% - 10px),1% 100%,0% calc(100% - 10px))",
};

function Barcode({ seed }) {
  const rnd = seedRandom(seed);
  const bars = Array.from({ length: 36 }, () => ({
    w: rnd() > 0.75 ? 3 : 1.5,
    h: 16 + Math.floor(rnd() * 14),
  }));
  return (
    <div className="flex items-end justify-center gap-[2px] h-9">
      {bars.map((b, i) => (
        <div
          key={i}
          style={{ width: b.w, height: b.h }}
          className="bg-[#2B2A2A]"
        />
      ))}
    </div>
  );
}

// Formats raw digits ("26072026") into "26/07/2026" (date/month/year) as
// the user types, regardless of browser/OS locale settings.
function formatTglDigits(digits) {
  let out = digits.slice(0, 2);
  if (digits.length > 2) out += "/" + digits.slice(2, 4);
  if (digits.length > 4) out += "/" + digits.slice(4, 8);
  return out;
}

// Converts "DDMMYYYY" digits into a validated ISO "yyyy-mm-dd" string,
// or null if the digits don't form a real calendar date.
function tglDigitsToIso(digits) {
  if (digits.length !== 8) return null;
  const dd = Number(digits.slice(0, 2));
  const mm = Number(digits.slice(2, 4));
  const yyyy = Number(digits.slice(4, 8));
  const test = new Date(yyyy, mm - 1, dd);
  const valid =
    test.getFullYear() === yyyy &&
    test.getMonth() === mm - 1 &&
    test.getDate() === dd;
  if (!valid) return null;
  return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

export default function StrukUmurHidup() {
  const [nama, setNama] = useState("");
  const [tglDigits, setTglDigits] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [stampOn, setStampOn] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [muted, setMuted] = useState(false);
  const strukRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (result) {
      const t = setTimeout(
        () => setStampOn(true),
        result.items.length * 80 + 300,
      );
      return () => clearTimeout(t);
    }
    setStampOn(false);
  }, [result]);

  function handleHitung() {
    setError("");
    if (tglDigits.length < 8) {
      setError("Isi tanggal lahir lengkap dulu ya (tgl/bln/thn).");
      return;
    }
    const iso = tglDigitsToIso(tglDigits);
    if (!iso) {
      setError("Tanggal lahirnya nggak valid, coba cek lagi ya.");
      return;
    }
    const birth = new Date(iso + "T00:00:00");
    if (birth > new Date()) {
      setError("Tanggal lahirnya kok di masa depan?");
      return;
    }
    setResult(computeStats(nama.trim() || "Kamu", iso));
    setCopied(false);

    // Diputar langsung di dalam handler klik ini (bukan di useEffect) supaya
    // browser tidak memblokir autoplay-nya - trigger dari klik user itu sah.
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.error("Audio play() gagal:", err.name, err.message);
      });
    }
  }

  function handleTglChange(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    setTglDigits(digits);
  }

  function handleReset() {
    setTglDigits("");
    setResult(null);
    setError("");
    setCopied(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }

  function toggleMute() {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setMuted(audioRef.current.muted);
  }

  async function handleCopy() {
    if (!result) return;
    const lines = result.items
      .map((it) => `${it.label}: ${it.value}`)
      .join("\n");
    const text = `*Struk Umur Hidup ${result.nama}*\nLahir: ${result.lahirLabel}\nUsia sekarang: ${result.usiaLabel}\n\n${lines}\n\n${result.generasi}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setError("Gagal menyalin, coba salin manual ya.");
    }
  }

  async function handleDownload() {
    if (!strukRef.current || !result) return;
    setDownloading(true);
    setError("");

    const node = strukRef.current;
    const opts = {
      pixelRatio: 3,
      backgroundColor: "#F5F2F2",
      cacheBust: true,
      // Skip embedding remote/webfont CSS - this is the #1 cause of
      // html-to-image silently throwing on Google Fonts / CORS-blocked
      // stylesheets. We only use system/mono fonts here so it's safe to skip.
      skipFonts: true,
      filter: (el) => {
        // canvas/iframe/video nodes can taint or crash the renderer
        const tag = el.tagName;
        return tag !== "IFRAME" && tag !== "VIDEO";
      },
    };

    // Make sure webfonts (if any) and layout have settled before capture,
    // otherwise toPng can grab a half-rendered node and throw.
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (_) {
        /* ignore font readiness errors, proceed anyway */
      }
    }
    await new Promise((r) => setTimeout(r, 50));

    const triggerDownload = (dataUrl) => {
      const link = document.createElement("a");
      const safeName = result.nama
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      link.download = `struk-umur-${safeName || "hidup"}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    };

    try {
      const dataUrl = await toPng(node, opts);
      triggerDownload(dataUrl);
    } catch (e) {
      console.error("toPng gagal:", e);
      // Fallback: try toBlob + object URL, sometimes succeeds when the
      // dataURL path fails on large/complex nodes.
      try {
        const blob = await toBlob(node, opts);
        if (!blob) throw new Error("blob kosong");
        const objectUrl = URL.createObjectURL(blob);
        triggerDownload(objectUrl);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
      } catch (e2) {
        console.error("toBlob fallback juga gagal:", e2);
        setError("Gagal mengunduh struk, coba screenshot manual ya.");
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#2B2A2A] flex items-center justify-center p-4">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes stampIn { from { opacity: 0; transform: rotate(-14deg) scale(0); } to { opacity: 1; transform: rotate(-14deg) scale(1); } }
        .line-anim { opacity: 0; animation: fadeUp 0.4s ease forwards; }
        .stamp-anim { opacity: 0; animation: stampIn 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }
      `}</style>

      <div className="w-full max-w-sm">
        {!result && (
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-white leading-tight">
              Struk Umur Hidup
            </h1>
            <p className="text-sm text-[#F5F2F2]/60 mt-2">
              Masukin tanggal lahir dan nama kamu.
            </p>
          </div>
        )}

        {!result && (
          <Card className="rounded-3xl border-none shadow-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nama">Nama (buat di struk)</Label>
                <Input
                  id="nama"
                  placeholder="Budi Santoso"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  maxLength={24}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tgl">Tanggal lahir (tgl/bln/thn)</Label>
                <Input
                  id="tgl"
                  type="text"
                  inputMode="numeric"
                  placeholder="26/07/2026"
                  value={formatTglDigits(tglDigits)}
                  onChange={handleTglChange}
                  maxLength={10}
                />
              </div>
              {error && <p className="text-sm text-[#FEB05D]">{error}</p>}
              <Button
                onClick={handleHitung}
                className="w-full bg-[#5A7ACD] hover:bg-[#4a6ab8] text-[#F5F2F2] font-semibold"
              >
                Cetak struk
              </Button>
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-4">
            <div
              ref={strukRef}
              style={zigzagStyle}
              className="bg-[#F5F2F2] px-6 pt-7 pb-4 font-mono text-[#2B2A2A] shadow-2xl"
            >
              <div className="text-center">
                <p className="font-bold text-[15px] tracking-wide">
                  STRUK UMUR HIDUP
                </p>
                <p className="text-[10px] text-[#2B2A2A]/55 mt-0.5">
                  TOKO KENANGAN &middot; JL. WAKTU NO. 1
                </p>
                <p className="text-[9.5px] text-[#2B2A2A]/55">
                  No. {result.noStruk} &middot; Kasir: SISTEM
                </p>
                <p className="font-bold text-[13px] mt-3">
                  {result.nama.toUpperCase()}
                </p>
                <p className="text-[10.5px] text-[#2B2A2A]/55">
                  lahir {result.lahirLabel}
                </p>
              </div>

              <hr className="border-t border-dashed border-[#2B2A2A]/20 my-3.5" />

              <div>
                {result.items.map((it, i) => {
                  const Icon = it.icon;
                  return (
                    <div
                      key={i}
                      className="line-anim flex items-center justify-between gap-2 py-1.5 border-b border-dotted border-[#2B2A2A]/20 text-[11.5px]"
                      style={{ animationDelay: `${i * 90}ms` }}
                    >
                      <span className="flex items-center gap-1.5 text-[#2B2A2A]/55">
                        <Icon
                          className="w-3.5 h-3.5 shrink-0"
                          strokeWidth={2.5}
                        />
                        {it.label}
                      </span>
                      <span className="font-bold whitespace-nowrap">
                        {it.value}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between mt-3.5 pt-2.5 border-t-2 border-[#2B2A2A] text-[13px] font-bold">
                <span>USIA SEKARANG</span>
                <span>{result.usiaLabel}</span>
              </div>

              <div className="flex justify-center">
                {stampOn && (
                  <div className="stamp-anim w-20 h-20 mt-4 rounded-full border-[3px] border-[#5A7ACD] text-[#5A7ACD] flex items-center justify-center text-center text-[10px] font-extrabold leading-tight">
                    SUDAH
                    <br />
                    DIJALANI
                  </div>
                )}
              </div>

              <div className="mt-4">
                <Barcode seed={result.nama + result.lahirLabel} />
              </div>
              <p className="text-center text-[9.5px] text-[#2B2A2A]/55 mt-1">
                dicetak {result.dicetakLabel} {result.dicetakJam}
              </p>
              <p className="text-center text-[9.5px] text-[#2B2A2A]/55">
                {result.generasi}
              </p>
              <p className="text-center text-[9.5px] text-[#2B2A2A]/55 mt-1">
                TERIMA KASIH SUDAH HIDUP HARI INI
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 bg-transparent border-[#F5F2F2]/40 text-[#F5F2F2] hover:bg-[#F5F2F2]/10 hover:text-[#F5F2F2]"
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Ulangi
              </Button>
              <Button
                onClick={handleCopy}
                className="flex-1 bg-[#5A7ACD] hover:bg-[#4a6ab8] text-[#F5F2F2] font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1.5" />
                    Salin
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 bg-[#FEB05D] text-[#2B2A2A] hover:bg-[#f5a343] font-semibold"
              >
                <Download className="w-4 h-4 mr-1.5" />
                {downloading ? "Menyimpan..." : "Unduh"}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-center text-[#FEB05D]">{error}</p>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={toggleMute}
                className="flex items-center gap-1.5 text-[11px] text-[#F5F2F2]/60 hover:text-[#F5F2F2] transition-colors"
              >
                {muted ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
                {muted ? "Unmute" : "Mute"}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-[#F5F2F2]/50 mt-6 tracking-wide">
          semua angka estimasi kasar ya
        </p>

        {/* Selalu ter-mount (tidak ikut kondisi `result`) supaya audioRef
            sudah pasti terisi begitu tombol "Cetak struk" diklik - kalau
            elemen ini ikut kondisi result, play() akan dipanggil sebelum
            elemen-nya sempat ada di DOM dan gagal diam-diam. */}
        <audio
          ref={audioRef}
          src={SONG_URL}
          loop
          preload="auto"
          onError={(e) => {
            console.error(
              "Audio gagal dimuat, cek file di:",
              SONG_URL,
              e.target.error,
            );
          }}
        />
      </div>
    </div>
  );
}
