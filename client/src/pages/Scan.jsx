import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useLocation } from "wouter";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Camera, AlertCircle, Info, RefreshCw, Smartphone, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Scan() {
    const [, setLocation] = useLocation();
    const [error, setError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [cameraLabel, setCameraLabel] = useState("");
    const html5QrCodeRef = useRef(null);
    const [isLocalhost, setIsLocalhost] = useState(true);

    useEffect(() => {
        setIsLocalhost(
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1" ||
            window.location.protocol === "https:"
        );
    }, []);

    const startScanner = async () => {
        try {
            setError(null);
            const html5QrCode = new Html5Qrcode("reader");
            html5QrCodeRef.current = html5QrCode;

            const config = {
                fps: 20,
                qrbox: { width: 280, height: 280 },
                aspectRatio: 1.0,
                videoConstraints: {
                    facingMode: "environment"
                }
            };

            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // ignore constant scanning messages
                }
            );

            // Force internal video element to be playsInline for iOS Safari
            setTimeout(() => {
                const videoElement = document.querySelector("#reader video");
                if (videoElement) {
                    videoElement.setAttribute("playsinline", "true");
                    videoElement.setAttribute("webkit-playsinline", "true");
                }
            }, 500);

            setIsScanning(true);
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
                setCameraLabel(devices[0].label);
            }
        } catch (err) {
            console.error("Camera start error:", err);
            if (err.toString().includes("Permission denied")) {
                setError("Camera permission denied. Please allow camera access in your browser settings.");
            } else if (err.toString().includes("NotFoundException")) {
                setError("No camera found on this device.");
            } else if (!isLocalhost) {
                setError("Camera access requires HTTPS or localhost. If you are testing on a mobile device, please use a secure connection (SSL/HTTPS).");
            } else {
                setError("Could not start camera. Please ensure no other app is using it and you've granted permissions.");
            }
        }
    };

    const handleScanSuccess = (decodedText) => {
        try {
            let pathWithParams = "";
            if (decodedText.startsWith("http")) {
                const url = new URL(decodedText);
                pathWithParams = url.pathname + url.search;
            } else {
                pathWithParams = decodedText;
            }

            if (pathWithParams.includes("/menu")) {
                stopScanner().then(() => {
                    setLocation(pathWithParams);
                });
            } else {
                setError("This QR code is not recognized by Parsik Cafe.");
            }
        } catch (e) {
            setError("Invalid QR code format detected.");
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
                setIsScanning(false);
            } catch (e) {
                console.error("Stop failed", e);
            }
        }
    };

    useEffect(() => {
        startScanner();
        return () => {
            stopScanner();
        };
    }, []);

    return (
        <div className="min-h-screen bg-background selection:bg-accent/20">


            <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 md:pt-32 flex flex-col items-center">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 max-w-2xl"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] mb-6 shadow-xl shadow-primary/20">
                        <Sparkles className="w-3.5 h-3.5" />
                        Smart Ordering
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-primary mb-4 tracking-tight uppercase italic">
                        The Quick <span className="text-accent serif normal-case italic font-light">Service</span>
                    </h1>
                    <p className="text-sm md:text-lg text-muted-foreground font-medium leading-relaxed opacity-70 px-4">
                        Seamlessly transition from the table to the kitchen. <br className="hidden sm:block" />
                        Scan the signature code at your table to begin your journey.
                    </p>
                </motion.div>

                <div className="w-full max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-none shadow-[0_50px_100px_-20px_rgba(25,48,28,0.2)] overflow-hidden bg-white rounded-[3rem] relative">
                            {/* Scanning indicator */}
                            <div className="absolute top-8 right-8 z-30">
                                <AnimatePresence>
                                    {isScanning ? (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-2 bg-white/90 backdrop-blur-md text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20 shadow-lg"
                                        >
                                            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                                            Active Lens
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-2 bg-white/90 backdrop-blur-md text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/20 shadow-lg"
                                        >
                                            Offline
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <CardContent className="p-0">
                                <div className="relative aspect-square sm:aspect-[4/3] bg-primary flex items-center justify-center overflow-hidden">
                                    <div id="reader" className="w-full h-full scale-[1.02]"></div>

                                    {/* Custom Viewfinder UI Overlay */}
                                    {isScanning && (
                                        <div className="absolute inset-0 z-10 pointer-events-none">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border-2 border-white/40 rounded-[2rem] shadow-[0_0_0_2000px_rgba(25,48,28,0.4)]">
                                                {/* Corner lines */}
                                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-2xl" />
                                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-2xl" />
                                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-2xl" />
                                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-2xl" />

                                                {/* Scanning beam */}
                                                <motion.div
                                                    animate={{ top: ['0%', '100%', '0%'] }}
                                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                    className="absolute left-0 right-0 h-0.5 bg-accent/40 shadow-[0_0_15px_rgba(215,134,84,0.8)]"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {!isScanning && !error && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary p-12 text-center text-white z-20">
                                            <div className="w-20 h-20 rounded-[2rem] bg-white/10 flex items-center justify-center mb-8 border border-white/20">
                                                <Camera className="w-10 h-10 text-accent" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-4 tracking-tight">Camera Restricted</h3>
                                            <p className="text-xs font-medium text-white/60 mb-8 max-w-[240px] leading-relaxed">
                                                Please authorize camera access to use the smart ordering capabilities.
                                            </p>
                                            <Button
                                                onClick={startScanner}
                                                className="h-14 px-10 rounded-2xl bg-white text-primary font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all active:scale-95"
                                            >
                                                Initialize Lens
                                            </Button>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 backdrop-blur-xl p-10 text-center z-20">
                                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-xl">
                                                <AlertCircle className="w-8 h-8 text-destructive" />
                                            </div>
                                            <h3 className="font-black text-primary text-xl mb-3 tracking-tighter">Connection Fault</h3>
                                            <p className="text-[11px] text-primary/70 font-bold leading-relaxed mb-8 max-w-[240px]">
                                                {error}
                                            </p>
                                            <Button
                                                onClick={startScanner}
                                                className="h-12 px-8 rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest hover:bg-primary/90"
                                            >
                                                <RefreshCw className="mr-2 w-4 h-4" />
                                                Retry Connection
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="p-10 space-y-8 bg-white">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-accent/10 flex items-center justify-center text-accent shrink-0 shadow-lg shadow-accent/5">
                                            <Smartphone className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-primary text-lg tracking-tight uppercase">Proprietary Scan</p>
                                            <p className="text-[11px] text-muted-foreground font-medium italic opacity-60">
                                                Instantly synchronizes table metadata with our live kitchen system.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-dashed border-border/80">
                                        <Button
                                            variant="outline"
                                            className="w-full h-14 rounded-2xl border-2 border-primary/10 text-primary hover:bg-primary hover:text-white font-black uppercase text-[9px] tracking-[0.2em] transition-all group"
                                            onClick={() => setLocation("/menu")}
                                        >
                                            Skip Scanning to Manual Menu
                                            <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className="mt-16 flex flex-col items-center gap-4 text-primary/30">
                    <div className="flex items-center gap-3 bg-secondary/30 px-6 py-2 rounded-full border border-border/40">
                        <Info className="w-4 h-4 text-accent" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Device Context: {cameraLabel ? cameraLabel.substring(0, 20) : "Negotiating..."}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
