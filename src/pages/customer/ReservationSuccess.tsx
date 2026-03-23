import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Share2, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function ReservationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const reservation = location.state?.reservation;
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!reservation) {
      navigate("/customer");
      return;
    }
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(reservation.pin_expiry).getTime();
      const diff = expiry - now;
      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${h}h ${m}m`);
    }, 1000);
    return () => clearInterval(interval);
  }, [reservation, navigate]);

  if (!reservation) return null;

  const pin = String(reservation.proxy_pin).padStart(3, "0");

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(
      `🥛 Reservation confirmed!\nPIN: ${pin}\nShow this PIN at the shop to collect your order.`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 text-center animate-reveal">
        <CheckCircle2 className="h-16 w-16 mx-auto text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reserved ✅</h1>
          <p className="text-sm text-muted-foreground mt-1">Show this PIN at the shop</p>
        </div>

        <div className="rounded-2xl border-2 border-primary/20 bg-card p-8 shadow-sm">
          <div className="text-6xl font-bold pin-display text-foreground">{pin}</div>
          <div className="mt-3 text-sm text-muted-foreground">
            Expires in {timeLeft}
          </div>
        </div>

        <button
          onClick={shareWhatsApp}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Share2 className="h-4 w-4" />
          Share on WhatsApp
        </button>

        <button
          onClick={() => navigate("/customer")}
          className="flex items-center gap-1.5 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
