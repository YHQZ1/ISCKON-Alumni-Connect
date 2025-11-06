/* eslint-disable no-empty */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, X, Send, Volume2, Trash2 } from "lucide-react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export default function VoiceNugget({ userType = "alumni" }) {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("Idle");
  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );
  const navigate = useNavigate();

  const wantRecognitionRef = useRef(false);
  const isStartingRef = useRef(false);
  const restartAttemptsRef = useRef(0);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      recognitionRef.current = null;
      setStatus("SpeechRecognition not supported. Use Chrome/Edge.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.continuous = true;

    wantRecognitionRef.current = false;
    isStartingRef.current = false;
    restartAttemptsRef.current = 0;

    rec.onstart = () => {
      setListening(true);
      setStatus("Listening...");
      isStartingRef.current = false;
    };

    rec.onresult = async (ev) => {
      try {
        const interim = [];
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          interim.push(ev.results[i][0].transcript);
        }
        const interimText = interim.join(" ");
        setTranscript(interimText);

        const last = ev.results[ev.results.length - 1];
        if (last.isFinal) {
          const text = last[0].transcript.trim();
          setTranscript(text);
          await sendToBackend(text);
        }
      } catch (err) {}
    };

    rec.onerror = (e) => {
      setStatus(`Error: ${e.error || e.message || "speech error"}`);
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
      isStartingRef.current = false;

      if (wantRecognitionRef.current) {
        if (restartAttemptsRef.current < 1) {
          restartAttemptsRef.current += 1;
          setTimeout(() => {
            try {
              rec.start();
            } catch (e) {
              wantRecognitionRef.current = false;
              setStatus("Idle");
            }
          }, 300);
          return;
        } else {
          wantRecognitionRef.current = false;
          setStatus("Idle");
          return;
        }
      }

      setStatus("Idle");
    };

    recognitionRef.current = {
      raw: rec,
      _markManualStop: () => {
        wantRecognitionRef.current = false;
        isStartingRef.current = false;
      },
    };

    return () => {
      try {
        if (recognitionRef.current && recognitionRef.current.raw) {
          recognitionRef.current.raw.onresult = null;
          recognitionRef.current.raw.onend = null;
          recognitionRef.current.raw.onerror = null;
        }
      } catch (e) {}
    };
  }, [open]);

  const sendToBackend = async (text) => {
    try {
      setIsLoading(true);
      setStatus("Thinking...");

      const token = localStorage.getItem("jwtToken");
      const metaDesc =
        document.querySelector('meta[name="description"]')?.content || "";
      const pageContext = `Path: ${window.location.pathname}. Short desc: ${metaDesc}`;

      const url = `${BASE_URL}/api/chat`;

      const response = await axios.post(
        url,
        {
          message: text,
          context: pageContext,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (data?.error) {
        setReply(`Error: ${data.error}`);
        setActions([]);
      } else {
        setReply(data?.reply || "(no reply)");
        setActions(data?.actions || []);
        speak(data?.reply || "");
      }

      setStatus("Idle");
    } catch {
      setReply("Error contacting server. Please try again.");
      setActions([]);
      setStatus("Idle");
    } finally {
      setIsLoading(false);
    }
  };

  const sendTextFallback = async () => {
    if (!transcript || transcript.trim() === "") return;
    await sendToBackend(transcript);
  };

  async function startListening() {
    wantRecognitionRef.current = true;
    if (isStartingRef.current) {
      return;
    }
    isStartingRef.current = true;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus("getUserMedia not supported");
      isStartingRef.current = false;
      wantRecognitionRef.current = false;
      return;
    }

    try {
      setStatus("Requesting mic permission...");
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus("Permission granted — starting recognition");

      const recObj = recognitionRef.current;
      if (!recObj || !recObj.raw) {
        setStatus("SpeechRecognition unavailable after permission");
        isStartingRef.current = false;
        wantRecognitionRef.current = false;
        return;
      }

      setTimeout(() => {
        try {
          recObj.raw.start();
        } catch {
          isStartingRef.current = false;
        }
      }, 100);
    } catch {
      setStatus("Microphone permission denied.");
      isStartingRef.current = false;
      wantRecognitionRef.current = false;
    }
  }

  function stopListening() {
    wantRecognitionRef.current = false;
    const recObj = recognitionRef.current;
    if (!recObj || !recObj.raw) {
      setListening(false);
      setStatus("Idle");
      return;
    }
    try {
      if (typeof recObj._markManualStop === "function")
        recObj._markManualStop();
      recObj.raw.stop();
    } catch (e) {}
    isStartingRef.current = false;
    setListening(false);
    setStatus("Idle");
  }

  function speak(text) {
    if (!synthRef.current || !("speechSynthesis" in window)) {
      return;
    }
    if (!text || typeof text !== "string" || text.trim() === "") return;
    if (synthRef.current.speaking) synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN";
    u.rate = 1;
    u.onend = () => {};
    u.onerror = (e) => {};
    synthRef.current.speak(u);
  }

  function clearAll() {
    setTranscript("");
    setReply("");
    setActions([]);
    setStatus("Idle");
  }

  function handleAction(action) {
    if (!action) return;
    if (action.type === "navigate" && action.url) {
      try {
        navigate(action.url);
      } catch {
        window.location.href = action.url;
      }
      setOpen(false);
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open voice assistant"
          className={`flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl ${
            listening
              ? "animate-pulse bg-gradient-to-br from-red-500 to-red-600"
              : "bg-gradient-to-br from-gray-800 to-gray-900"
          }`}
          title="Voice Assistant"
        >
          <Mic className="h-6 w-6 text-white" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Mic className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Voice Assistant</h3>
                    <p className="text-gray-300 text-sm">
                      Speak naturally, get instant help
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    stopListening();
                  }}
                  className="text-white hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      status === "Listening..."
                        ? "text-green-600"
                        : status === "Thinking..."
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!listening) startListening();
                      else stopListening();
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-sm transition-all duration-300 ${
                      listening
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-white"
                    }`}
                    disabled={isLoading}
                  >
                    {listening ? (
                      <>
                        <MicOff className="h-4 w-4" /> Stop
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" /> Start
                      </>
                    )}
                  </button>

                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Clear
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-xs text-gray-700 font-medium mb-1">
                  You said
                </div>
                <div className="mt-1 text-gray-800 min-h-6">
                  {transcript || (
                    <span className="text-gray-400">
                      Speak or type your question...
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 font-medium mb-1">
                  Assistant
                </div>
                <div className="mt-1 text-gray-800 whitespace-pre-wrap min-h-6">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div>
                      <span className="text-gray-500">Thinking...</span>
                    </div>
                  ) : reply ? (
                    reply
                  ) : (
                    <span className="text-gray-400">I'll respond here...</span>
                  )}
                </div>
              </div>

              <div className="mt-2">
                <div className="relative flex">
                  <input
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Type your question here..."
                    className="flex-1 border border-gray-300 rounded-l-xl p-3 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                    onKeyPress={(e) => e.key === "Enter" && sendTextFallback()}
                  />
                  <button
                    onClick={sendTextFallback}
                    disabled={!transcript.trim() || isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-r-xl font-medium shadow-sm hover:bg-gray-700 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>

              {actions && actions.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="text-xs text-gray-500 font-medium">
                    Quick Actions
                  </div>
                  {actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAction(action)}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors text-left text-sm"
                    >
                      {action.label || "Action"}
                    </button>
                  ))}
                </div>
              )}

              {reply && !isLoading && (
                <div className="flex justify-end">
                  <button
                    onClick={() => speak(reply)}
                    className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                  >
                    <Volume2 className="h-4 w-4" /> Replay
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                Tip: Speak clearly and keep your questions concise for best
                results.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
