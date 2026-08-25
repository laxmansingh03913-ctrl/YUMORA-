"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Languages,
  BookOpen,
  Users,
  MessageSquare,
  X,
  Send,
  Loader2,
  Check,
  Copy,
  RotateCcw,
  Bot,
  HelpCircle,
  Shield,
  Zap,
} from "lucide-react";
import { LanguageCode } from "@/lib/types";

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterTitle: string;
  chapterNumber: number;
  novelTitle: string;
  authorName: string;
  chapterContent: string;
  onApplyTranslatedContent?: (translatedText: string, targetLang: string) => void;
}

type TabType = "translate" | "summary" | "characters" | "chat";

const SUPPORTED_TRANSLATION_LANGUAGES = [
  { code: "hi", name: "Hindi (हिन्दी)", flag: "🇮🇳" },
  { code: "ja", name: "Japanese (日本語)", flag: "🇯🇵" },
  { code: "es", name: "Spanish (Español)", flag: "🇪🇸" },
  { code: "fr", name: "French (Français)", flag: "🇫🇷" },
  { code: "de", name: "German (Deutsch)", flag: "🇩🇪" },
  { code: "ko", name: "Korean (한국어)", flag: "🇰🇷" },
  { code: "pt", name: "Portuguese (Português)", flag: "🇧🇷" },
  { code: "zh", name: "Chinese (中文)", flag: "🇨🇳" },
];

export function AIAssistantModal({
  isOpen,
  onClose,
  chapterTitle,
  chapterNumber,
  novelTitle,
  authorName,
  chapterContent,
  onApplyTranslatedContent,
}: AIAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("translate");
  const [selectedLang, setSelectedLang] = useState<string>("hi");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Summary State
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryBullets, setSummaryBullets] = useState<string[] | null>(null);

  // Chat State
  const [messages, setMessages] = useState<
    { id: string; sender: "user" | "ai"; text: string; time: string }[]
  >([
    {
      id: "msg-1",
      sender: "ai",
      text: `Hello! I'm your Yomika AI Story Companion for "${novelTitle}". Ask me anything about Chapter ${chapterNumber}, characters, power rankings, or lore!`,
      time: "Just now",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  if (!isOpen) return null;

  // Handle High-Fidelity Translation Simulation
  const handleTranslate = async () => {
    setIsTranslating(true);
    setTranslatedText(null);

    // Simulate AI Translation Engine
    await new Promise((resolve) => setTimeout(resolve, 800));

    let translation = "";
    if (selectedLang === "hi") {
      translation = `[अध्याय ${chapterNumber}: ${chapterTitle} - हिन्दी अनुवाद]\n\nसितारों की छाया में, प्राचीन ऊर्जा धीरे-धीरे जागृत होने लगी थी। आकाशीय सम्राट ने अपनी तलवार को मजबूती से थामा। हवा में गूंजती रहस्यमयी आवाजें इस बात का संकेत दे रही थीं कि एक महान युद्ध की शुरुआत होने वाली है।\n\n"अगर भाग्य ने हमें चुना है, तो हम पीछे नहीं हटेंगे," उसने ठंडे स्वर में कहा, उसकी आँखों में स्वर्णिम आभा चमक रही थी।`;
    } else if (selectedLang === "ja") {
      translation = `[第${chapterNumber}章: ${chapterTitle} - 日本語訳]\n\n星々の影の下で、古代のエネルギーが静かに目覚め始めた。天界の君主は霊剣を固く握りしめた。風に響く神秘的な声は、新たな神話の幕開けを告げていた。\n\n「運命が我らを選んだのなら、退く道などない」彼は静かに呟き、その双眸には黄金の光が宿っていた。`;
    } else if (selectedLang === "es") {
      translation = `[Capítulo ${chapterNumber}: ${chapterTitle} - Traducción al Español]\n\nBajo la sombra de las estrellas, la energía ancestral comenzaba a despertar lentamente. El Soberano Celestial empuñó su espada espiritual con firmeza. Las voces místicas resonaban en el viento.\n\n"Si el destino nos ha elegido, no daremos ni un solo paso atrás", murmuró con calma mientras sus ojos brillaban con un resplandor dorado.`;
    } else {
      translation = `[Chapter ${chapterNumber}: ${chapterTitle} - Translated to ${selectedLang.toUpperCase()}]\n\nUnder the celestial canopy, the ancient resonance awakened across the realm. The Sovereign raised his blade, feeling the pulsating aura of the forgotten gods. "Our destiny unfolds now," he declared with absolute conviction.`;
    }

    setTranslatedText(translation);
    setIsTranslating(false);
  };

  // Handle 3-Bullet Summary Generation
  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    setSummaryBullets(null);

    await new Promise((resolve) => setTimeout(resolve, 700));

    setSummaryBullets([
      `⚔️ **The Catalyst:** The ancient celestial seal fractured, releasing latent soul resonance across the temple grounds.`,
      `🌌 **Character Breakthrough:** The Sovereign made a decisive choice to bond with the astral blade, surpassing previous realm limitations.`,
      `🔥 **Key Cliffhanger:** Mysterious shadows emerged from the perimeter, setting the stage for an unavoidable confrontation in the next chapter.`,
    ]);
    setIsSummarizing(false);
  };

  // Handle Interactive Chat Query
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery.trim();
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user" as const,
      text: userText,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsAiThinking(true);

    await new Promise((resolve) => setTimeout(resolve, 750));

    let aiReply = "";
    const lower = userText.toLowerCase();
    if (lower.includes("who") || lower.includes("character") || lower.includes("sovereign")) {
      aiReply = `In this universe, the Sovereign is the heir to the Astral Throne. He possesses the Celestial Monarch Bloodline which allows him to manipulate astral mana without fatigue.`;
    } else if (lower.includes("sword") || lower.includes("blade") || lower.includes("weapon")) {
      aiReply = `The blade featured in Chapter ${chapterNumber} is known as the "Astral Edge"—forged thousands of years ago during the First Starfall War. It only resonates with worthy bloodlines.`;
    } else if (lower.includes("what happened") || lower.includes("recap") || lower.includes("summary")) {
      aiReply = `In Chapter ${chapterNumber}, the protagonist activates the sealed celestial boundary. The chapter emphasizes his transition from an outcast to a recognized powerhouse!`;
    } else {
      aiReply = `Great question! Based on "${novelTitle}" (Chapter ${chapterNumber}), the author ${authorName} creates a rich narrative combining eastern mythology with fast-paced action. Keep reading to see how this plotline unfolds!`;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiReply,
        time: "Just now",
      },
    ]);
    setIsAiThinking(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing Top Banner */}
        <div className="h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>Yumora AI Story Companion</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-extrabold uppercase">
                  GPT-4o Enhanced
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500 truncate max-w-xs sm:max-w-md">
                Chapter {chapterNumber}: {chapterTitle} • {novelTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#151518] overflow-x-auto no-scrollbar">
          {[
            { id: "translate", label: "Instant Translator", icon: Languages },
            { id: "summary", label: "3-Bullet Summary", icon: BookOpen },
            { id: "characters", label: "Character Codex", icon: Users },
            { id: "chat", label: "Ask AI Companion", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#D91E18] text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: TRANSLATOR */}
          {activeTab === "translate" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100">
                    Translate Chapter to Your Language
                  </h4>
                  <p className="text-xs text-zinc-500">
                    High-accuracy AI translation with tone and style preservation
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                  >
                    {SUPPORTED_TRANSLATION_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:opacity-95 text-white text-xs font-black shadow-md shadow-rose-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Translating...</span>
                      </>
                    ) : (
                      <>
                        <Languages className="w-3.5 h-3.5" />
                        <span>Translate Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Translation Output Box */}
              {translatedText ? (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">
                      Translation Ready
                    </span>
                    <button
                      onClick={() => copyToClipboard(translatedText)}
                      className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Translation</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line font-serif">
                    {translatedText}
                  </p>
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
                  <Languages className="w-8 h-8 text-zinc-400 mx-auto" />
                  <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    Select a language above and click &quot;Translate Now&quot;
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Supports Hindi, Japanese, Spanish, French, German, and more.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 3-BULLET SUMMARY */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100">
                    Chapter Highlights & Recap
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Quick 30-second summary of key developments in Chapter {chapterNumber}
                  </p>
                </div>

                <button
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSummarizing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Summarizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Recap</span>
                    </>
                  )}
                </button>
              </div>

              {summaryBullets ? (
                <div className="space-y-2.5 animate-in fade-in">
                  {summaryBullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: bullet.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
                  <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
                  <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    Click &quot;Generate Recap&quot; to extract key bullet points
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHARACTER CODEX */}
          {activeTab === "characters" && (
            <div className="space-y-4">
              <div>
                <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100">
                  Chapter Character Roster & Lore
                </h4>
                <p className="text-xs text-zinc-500">
                  Key personalities, faction alignments, and powers active in this chapter
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-xs">
                      👑
                    </div>
                    <div>
                      <h5 className="font-black text-xs text-zinc-900 dark:text-zinc-100">
                        The Starfall Sovereign
                      </h5>
                      <span className="text-[10px] text-zinc-400">Protagonist • Astral Monarch</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Master of astral mana and bearer of the celestial destiny. Wields the sealed edge of the first empire.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      🗡️
                    </div>
                    <div>
                      <h5 className="font-black text-xs text-zinc-900 dark:text-zinc-100">
                        Commander Kaelen
                      </h5>
                      <span className="text-[10px] text-zinc-400">Guardian • Silver Vanguard</span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Elite protector guarding the temple gates. Sworn allegiance to the royal throne and the ancestral covenant.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHAT WITH STORY COMPANION */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-[340px] space-y-3">
              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "ai" && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-[#D91E18] text-white rounded-tr-none font-medium"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200/80 dark:border-zinc-700/80"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={`text-[9px] block mt-1 ${
                          msg.sender === "user" ? "text-rose-200" : "text-zinc-400"
                        }`}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}

                {isAiThinking && (
                  <div className="flex items-center gap-2 text-zinc-400 text-xs pl-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                    <span>Story AI is thinking...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask about lore, cultivation ranks, or characters..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isAiThinking}
                  className="px-3.5 py-2 rounded-xl bg-[#D91E18] hover:bg-[#B71813] disabled:opacity-40 text-white font-bold text-xs transition flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
