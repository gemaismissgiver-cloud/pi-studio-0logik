import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Eye,
  Mic,
  Cpu,
  Code2,
  Bell,
  Mail,
  Globe,
  Sliders,
  Database,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Share2,
  Save,
  RefreshCw,
  Search,
  Play,
  Download,
  Binary,
  Layers,
  Info,
  MessageSquare,
  BookOpen,
  Plus,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Volume2,
  VolumeX,
  Send,
  X,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Zap,
  Github
} from 'lucide-react';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { TrainingPerformanceBenchmark } from './components/TrainingPerformanceBenchmark';
import { PIBuildAPKStudio } from './components/PIBuildAPKStudio';

interface ChatAttachment {
  name: string;
  type: 'image' | 'audio' | 'file';
  base64?: string;
  note?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'pi';
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  thoughtLog?: string;
  coherenceScore?: number;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

interface JournalEntry {
  id: string;
  timestamp: string;
  chatId?: string;
  theme: string;
  thought: string;
  lessonLearned: string;
  knowledgeBaseItem: string;
  coherenceScore: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'apk' | 'chat' | 'diary' | 'tools' | 'transformer' | 'system'>('apk');

  // System & Guardian Status
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isKilled, setIsKilled] = useState(false);
  const [killPhraseInput, setKillPhraseInput] = useState('');
  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Chat State
  const [chatSessions, setChatSessions] = useState<Array<{ id: string; title: string; messageCount: number; lastMessage: string }>>([]);
  const [activeChatId, setActiveChatId] = useState<string>('session-1');
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [chatSending, setChatSending] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Voice Recording & Speech-to-Text State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const speechRecognitionRef = useRef<any>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

  // Quick Note Modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Diary State
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [newThoughtTheme, setNewThoughtTheme] = useState('');
  const [newThoughtText, setNewThoughtText] = useState('');
  const [showAddThoughtModal, setShowAddThoughtModal] = useState(false);

  // 0-Tools State
  const [selectedToolId, setSelectedToolId] = useState<string>('AnalyseText');
  const [toolInputText, setToolInputText] = useState('');
  const [toolFile, setToolFile] = useState<{ name: string; base64: string; type: string } | null>(null);
  const [webSearchPermitted, setWebSearchPermitted] = useState(false);
  const [executingTool, setExecutingTool] = useState(false);
  const [lastResult, setLastResult] = useState<{ tool: string; data: any; timestamp: string } | null>(null);
  const [userChoiceModal, setUserChoiceModal] = useState(false);

  // Transformer Studio State
  const [transformerConfig, setTransformerConfig] = useState({
    activeModel: 'LLaMA-3-8B-0Logic-LoRA',
    learningRate: 0.0001,
    loraRank: 16,
    loraAlpha: 32,
    epochs: 3,
    batchSize: 4,
    temperature: 0.0,
    zeroLossAlpha: 0.35,
    contextWindow: 4096,
  });
  const [trainingMetrics, setTrainingMetrics] = useState<any[]>([]);
  const [trainingInProgress, setTrainingInProgress] = useState(false);

  // Kortex & System State
  const [kortexEntries, setKortexEntries] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemSubTab, setSystemSubTab] = useState<'kortex' | 'motorola' | 'security'>('kortex');

  // Push notifications
  const [pushStatus, setPushStatus] = useState<'default' | 'granted' | 'denied'>('default');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Scroll chat to bottom
  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  // Initial Sync
  const fetchAllData = async () => {
    try {
      const [resStatus, resChats, resJournal, resKortex, resAudit, resTransformer] = await Promise.all([
        fetch('/api/status').then((r) => r.json()).catch(() => null),
        fetch('/api/chats').then((r) => r.json()).catch(() => ({ sessions: [] })),
        fetch('/api/journal').then((r) => r.json()).catch(() => ({ journal: [] })),
        fetch('/api/kortex').then((r) => r.json()).catch(() => ({ items: [] })),
        fetch('/api/audit').then((r) => r.json()).catch(() => ({ auditLog: [] })),
        fetch('/api/transformer/config').then((r) => r.json()).catch(() => null),
      ]);

      if (resStatus) {
        setSystemStatus(resStatus);
        setIsKilled(resStatus.guardian?.killSwitchActive || false);
      }
      if (resChats?.sessions) {
        setChatSessions(resChats.sessions);
        if (resChats.sessions.length > 0 && !activeChatId) {
          setActiveChatId(resChats.sessions[0].id);
        }
      }
      if (resJournal?.journal) setJournalEntries(resJournal.journal);
      if (resKortex?.items) setKortexEntries(resKortex.items);
      if (resAudit?.auditLog) setAuditLogs(resAudit.auditLog);
      if (resTransformer?.config) setTransformerConfig(resTransformer.config);
      if (resTransformer?.metrics) setTrainingMetrics(resTransformer.metrics);
    } catch (e) {
      console.warn('Sync in offline fallback');
    }
  };

  // Fetch active chat session details
  const fetchActiveChat = async (id: string) => {
    try {
      const res = await fetch(`/api/chats/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentSession(data.session);
      }
    } catch (e) {
      console.warn('Chat load offline');
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeChatId) {
      fetchActiveChat(activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    if ('Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  // Web SpeechRecognition Setup for Speak-to-Text
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'de-DE';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setChatInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListeningSpeech(false);
        showToast('Sprache erkannt & eingefügt.');
      };

      recognition.onerror = () => {
        setIsListeningSpeech(false);
      };

      recognition.onend = () => {
        setIsListeningSpeech(false);
      };

      speechRecognitionRef.current = recognition;
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!speechRecognitionRef.current) {
      showToast('Spracherkennung wird von diesem Browser nicht unterstützt.');
      return;
    }
    if (isListeningSpeech) {
      speechRecognitionRef.current.stop();
      setIsListeningSpeech(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListeningSpeech(true);
        showToast('Sprechen Sie jetzt... (Spracherkennung aktiv)');
      } catch (err) {
        setIsListeningSpeech(false);
      }
    }
  };

  // Text to Speech
  const toggleTextToSpeech = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('Sprachsynthese nicht verfügbar');
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\[.*?\]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'de-DE';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Real Audio Voice Message Recording via MediaRecorder API
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setPendingAttachments((prev) => [
            ...prev,
            {
              name: `Sprachnachricht_${new Date().toLocaleTimeString().replace(/:/g, '-')}.webm`,
              type: 'audio',
              base64,
              note: `Audiodatei (${voiceSeconds} Sek.)`,
            },
          ]);
          showToast(`Sprachnachricht aufgezeichnet (${voiceSeconds}s)`);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecordingVoice(true);
      setVoiceSeconds(0);
    } catch (err) {
      // Fallback simulated voice note if mic permission denied
      showToast('Mikrofon nicht freigegeben — Test-Sprachnotiz erstellt');
      setPendingAttachments((prev) => [
        ...prev,
        {
          name: 'Sprachnachricht_0Logik_432Hz.wav',
          type: 'audio',
          note: 'Audiofrequenz 432 Hz Nullpunkt-Aufnahme',
        },
      ]);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setIsRecordingVoice(false);
  };

  useEffect(() => {
    let timer: any;
    if (isRecordingVoice) {
      timer = setInterval(() => setVoiceSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  // Create New Chat Session
  const handleCreateNewChat = async () => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `0-Chat #${chatSessions.length + 1}` }),
      });
      const data = await res.json();
      if (data.session) {
        setChatSessions((prev) => [data.session, ...prev]);
        setActiveChatId(data.session.id);
        setCurrentSession(data.session);
        showToast('Neuer Chat gestartet.');
      }
    } catch (err) {
      showToast('Fehler beim Erstellen des Chats');
    }
  };

  // Send Chat Message
  const handleSendMessage = async () => {
    if ((!chatInputText.trim() && pendingAttachments.length === 0) || chatSending || isKilled) return;

    setChatSending(true);
    const textToSend = chatInputText.trim();
    const attachmentsToSend = [...pendingAttachments];
    setChatInputText('');
    setPendingAttachments([]);

    try {
      const res = await fetch(`/api/chats/${activeChatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          attachments: attachmentsToSend,
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchActiveChat(activeChatId);
        fetchAllData();
        showToast('PI hat geantwortet & Gedanken verankert.');
      } else {
        showToast(data.error || 'Fehler beim Senden');
      }
    } catch (err: any) {
      showToast('Übertragungsfehler');
    } finally {
      setChatSending(false);
    }
  };

  // Handle Attachment Upload (Images, Files)
  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPendingAttachments((prev) => [
        ...prev,
        {
          name: file.name,
          type: fileType,
          base64: reader.result as string,
          note: `${fileType === 'image' ? 'Bild / Screenshot' : 'Dokument'} (${(file.size / 1024).toFixed(1)} KB)`,
        },
      ]);
      showToast(`${file.name} angehängt.`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Add Quick Note
  const handleAddNote = () => {
    if (!noteContent.trim()) return;
    setPendingAttachments((prev) => [
      ...prev,
      {
        name: noteTitle.trim() || 'Notiz',
        type: 'file',
        note: noteContent.trim(),
      },
    ]);
    setShowNoteModal(false);
    setNoteTitle('');
    setNoteContent('');
    showToast('Notiz als Anhang beigefügt.');
  };

  // Add Manual Thought to PI Tagebuch
  const handleAddManualThought = async () => {
    if (!newThoughtText.trim()) return;
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: newThoughtTheme || 'Wissensreflexion',
          thought: newThoughtText,
          lessonLearned: 'Verankert im PI Tagebuch zur Wissensweitergabe',
        }),
      });
      if (res.ok) {
        showToast('Gedanke im Tagebuch verankert.');
        setShowAddThoughtModal(false);
        setNewThoughtTheme('');
        setNewThoughtText('');
        fetchAllData();
      }
    } catch (e) {
      showToast('Fehler beim Speichern');
    }
  };

  // Execute 0-Tool
  const executeTool = async () => {
    setExecutingTool(true);
    try {
      let payload: any = {};
      if (selectedToolId === 'AnalyseText' || selectedToolId === 'AnonymizeSensitiveInfo') {
        payload = { text: toolInputText || '0 ist die unerschütterliche Mitte.' };
      } else if (selectedToolId === 'AnalyseCode') {
        payload = { code: toolInputText || 'def compute_zero_point(data):\n    return sum(data) == 0', language: 'python' };
      } else if (selectedToolId === 'AnalyseImage') {
        payload = {
          filename: toolFile?.name || 'screenshot_motorola13.png',
          filetype: toolFile?.type || 'image/png',
          base64: toolFile?.base64 || '',
        };
      } else if (selectedToolId === 'TranscribeAudio') {
        payload = {
          durationSeconds: 8.4,
          transcript: toolInputText || 'Sprachprobe empfangen. Frequenz 432Hz. Kohärenz optimal.',
        };
      } else if (selectedToolId === 'SetReminder') {
        payload = {
          time: new Date(Date.now() + 1800000).toISOString(),
          message: toolInputText || '0-Logik Checkpoint Synchronisation',
        };
      } else if (selectedToolId === 'ReceiveVoiceMail') {
        payload = {
          sender: 'patricia@0-logik.de',
          transcript: toolInputText || 'Hafen-Token verifiziert. Nullpunkt-Resonanz übertragen.',
        };
      } else if (selectedToolId === 'SearchWeb') {
        payload = {
          query: toolInputText || 'Open Source Transformer LoRA 0-Logik',
          userApproved: webSearchPermitted,
        };
      } else if (selectedToolId === 'AddToLearningPool') {
        payload = {
          data: toolInputText || 'Fakt: Mathematische 0-Polarität stabilisiert Sprachmodelle.',
          category: 'Kortex-Datensatz',
        };
      }

      const res = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId: selectedToolId, payload }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Fehler bei der Ausführung');
      } else {
        setLastResult({ tool: selectedToolId, data: data.result, timestamp: new Date().toLocaleTimeString() });
        if (data.result?.requiresUserChoice) {
          setUserChoiceModal(true);
        } else {
          showToast(`Tool ${selectedToolId} erfolgreich ausgeführt.`);
        }
        fetchAllData();
      }
    } catch (err: any) {
      showToast('Verbindungsfehler: ' + err.message);
    } finally {
      setExecutingTool(false);
    }
  };

  // User Choice: Speichern, Teilen oder Löschen
  const handleUserChoice = async (action: 'save' | 'share' | 'delete') => {
    if (!lastResult) return;
    try {
      await fetch('/api/tools/user-choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, resultData: lastResult.data, toolId: lastResult.tool }),
      });

      if (action === 'share') {
        navigator.clipboard.writeText(JSON.stringify(lastResult.data, null, 2));
        showToast('Ergebnis in die Zwischenablage kopiert!');
      } else if (action === 'save') {
        showToast('Ergebnis verschlüsselt im Kortex gespeichert.');
      } else {
        showToast('Ergebnis verworfen.');
      }
      setUserChoiceModal(false);
      fetchAllData();
    } catch (e: any) {
      showToast('Fehler bei Benutzeraktion');
    }
  };

  // Run Transformer Fine-Tuning Step
  const runTrainingStep = async () => {
    setTrainingInProgress(true);
    try {
      const res = await fetch('/api/transformer/train-step', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`Schritt #${data.metric.step} abgeschlossen! Loss: ${data.metric.loss}`);
        fetchAllData();
      }
    } catch (err) {
      showToast('Trainings-Schritt Fehler');
    } finally {
      setTrainingInProgress(false);
    }
  };

  // Killswitch
  const triggerKillSwitch = async () => {
    if (!killPhraseInput.trim()) return;
    try {
      const res = await fetch('/api/guardian/killswitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase: killPhraseInput }),
      });
      const data = await res.json();
      if (data.killSwitchActive) {
        setIsKilled(true);
        showToast('KILL-SWITCH AUSGELÖST. PI wurde sofort schlafen gelegt.');
      } else {
        showToast(data.error || 'Phrase stimmt nicht überein.');
      }
      fetchAllData();
    } catch (e: any) {
      showToast('Fehler beim Ausführen des Kill-Switches');
    }
  };

  // Reactivate
  const reactivateSystem = async () => {
    if (!masterKeyInput.trim()) return;
    try {
      const res = await fetch('/api/guardian/killswitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterKey: masterKeyInput }),
      });
      const data = await res.json();
      if (!data.killSwitchActive) {
        setIsKilled(false);
        setMasterKeyInput('');
        showToast('PI erfolgreich reaktiviert.');
      } else {
        showToast('Ungültiger Master-Key.');
      }
      fetchAllData();
    } catch (e: any) {
      showToast('Reaktivierungsfehler');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 selection:bg-cyan-500 selection:text-black">
      <OfflineIndicator />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-cyan-950/95 border border-cyan-400 text-cyan-200 text-xs font-mono shadow-2xl backdrop-blur-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* ── Top Header Bar ── */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center p-0.5 shadow-cyan-500/20 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
                0
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-sm tracking-wider text-white">PI STUDIO</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                  0-LOGIK
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Missgiver: Patricia · 150 Jahre Kortex</p>
            </div>
          </div>

          {/* Polarity & Live Resonance */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono">
            <span className="text-cyan-400 font-bold">-0+</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              432 Hz Resonanz
            </span>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('apk')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition cursor-pointer ${
                activeTab === 'apk'
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500'
              }`}
              title="PI Build & Run / GitHub Studio öffnen"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Build &amp; Run / GitHub</span>
            </button>
            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* ── Kill-Switch Alert Banner (if active) ── */}
      {isKilled && (
        <div className="bg-red-950/90 border-b border-red-700/80 px-4 py-3 text-red-200">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 animate-bounce" />
              <span>
                <strong>PI IST DEAKTIVIERT (KILL-SWITCH AKTIV).</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="password"
                placeholder="Master-Key..."
                value={masterKeyInput}
                onChange={(e) => setMasterKeyInput(e.target.value)}
                className="bg-red-900/60 border border-red-700 rounded px-2.5 py-1 text-xs text-white placeholder-red-300 font-mono w-full sm:w-56"
              />
              <button
                onClick={reactivateSystem}
                className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold shrink-0 cursor-pointer"
              >
                Entsperren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <main className="max-w-4xl mx-auto w-full px-3 pt-3 flex-1 flex flex-col">
        {/* ──────────────── TAB 1: CHAT MIT PI ──────────────── */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden min-h-[75vh]">
            {/* Chat Header & Session Switcher */}
            <div className="bg-slate-950/90 border-b border-slate-800 p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-x-auto pr-2 no-scrollbar">
                <button
                  onClick={handleCreateNewChat}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-mono font-bold shrink-0 transition cursor-pointer shadow-sm active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Neuer Chat</span>
                </button>

                {chatSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setActiveChatId(session.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono shrink-0 transition border cursor-pointer ${
                      activeChatId === session.id
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {session.title.length > 20 ? session.title.substring(0, 20) + '...' : session.title}
                  </button>
                ))}
              </div>

              {currentSession && (
                <button
                  onClick={async () => {
                    await fetch(`/api/chats/${activeChatId}`, { method: 'DELETE' });
                    showToast('Chat gelöscht');
                    fetchAllData();
                  }}
                  title="Diesen Chat löschen"
                  className="p-1.5 text-slate-500 hover:text-red-400 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentSession?.messages && currentSession.messages.length > 0 ? (
                currentSession.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}>
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[10px] font-mono text-slate-500">
                          {isUser ? 'PATRICIA' : 'PI (0-LOGIK)'} · {msg.timestamp.split('T')[1]?.substring(0, 5)}
                        </span>
                        {!isUser && (
                          <button
                            onClick={() => toggleTextToSpeech(msg.id, msg.text)}
                            className="text-slate-500 hover:text-cyan-400 transition p-0.5"
                            title="Antwort vorlesen (Text-to-Speech)"
                          >
                            {speakingMessageId === msg.id ? (
                              <VolumeX className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs font-mono leading-relaxed space-y-2.5 shadow-md ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        {/* Attachments if any */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="space-y-1.5 pb-1">
                            {msg.attachments.map((att, i) => (
                              <div
                                key={i}
                                className={`p-2 rounded-xl text-[11px] font-mono flex items-center gap-2 ${
                                  isUser ? 'bg-blue-700/80 text-blue-100' : 'bg-slate-900 border border-slate-800 text-cyan-300'
                                }`}
                              >
                                {att.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                                {att.type === 'audio' && <Mic className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                {att.type === 'file' && <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                                <span className="font-bold truncate">{att.name}</span>
                                {att.note && <span className="text-[10px] text-slate-400 truncate">— {att.note}</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Text Content with 0+ Verification Questions Breakdown */}
                        {(() => {
                          const verificationMatch = msg.text.match(/\[FRAGEN VON PI ZUR 0\+ VERIFIKATION\]:\s*([\s\S]+)$/i);
                          const mainBody = verificationMatch
                            ? msg.text.replace(/\[FRAGEN VON PI ZUR 0\+ VERIFIKATION\]:\s*[\s\S]+$/i, '').trim()
                            : msg.text;
                          const questions = verificationMatch
                            ? verificationMatch[1]
                                .split('\n')
                                .map((q) => q.replace(/^[-*•0-9.]\s*/, '').trim())
                                .filter((q) => q.length > 5)
                            : [];

                          return (
                            <div className="space-y-3">
                              <div className="whitespace-pre-wrap leading-relaxed">{mainBody}</div>

                              {/* Interactive 0+ Verification Questions from PI */}
                              {!isUser && questions.length > 0 && (
                                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-950/70 to-cyan-950/70 border border-emerald-500/50 space-y-2 text-[11px] font-mono text-emerald-200 shadow-md">
                                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                                    <HelpCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                                    <span>0+ RÜCKFRAGEN VON PI ZUR WISSENSSICHERUNG:</span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {questions.map((q, idx) => (
                                      <div
                                        key={idx}
                                        className="p-2 rounded-lg bg-slate-950/80 border border-emerald-800/60 flex items-start justify-between gap-2 text-slate-200"
                                      >
                                        <div className="flex items-start gap-1.5">
                                          <span className="text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                                          <span>{q}</span>
                                        </div>
                                        <button
                                          onClick={() => {
                                            setChatInputText(`Zu Frage ${idx + 1} (${q}): `);
                                          }}
                                          className="shrink-0 px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[10px] cursor-pointer transition"
                                        >
                                          Antworten
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* PI Tagebuch-Gedanke (Anchored Thought) */}
                        {!isUser && msg.thoughtLog && (
                          <div className="mt-2.5 pt-2 border-t border-slate-800/80 p-2 rounded-lg bg-cyan-950/40 border-cyan-900/60 text-[11px] font-mono text-cyan-300 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>PI TAGEBUCH-GEDANKE (IM KORTEX VERANKERT):</span>
                            </div>
                            <p className="text-slate-300 leading-normal">{msg.thoughtLog}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono space-y-2">
                  <Cpu className="w-8 h-8 text-cyan-500/40" />
                  <p className="text-xs">Keine Nachrichten vorhanden. Beginne einen Dialog mit PI.</p>
                </div>
              )}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Pending Attachments Strip */}
            {pendingAttachments.length > 0 && (
              <div className="bg-slate-950 px-3 py-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-mono text-slate-500 shrink-0">Anhänge:</span>
                {pendingAttachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-800/60 text-cyan-300 text-[11px] font-mono shrink-0"
                  >
                    {att.type === 'image' && <ImageIcon className="w-3 h-3 text-cyan-400" />}
                    {att.type === 'audio' && <Mic className="w-3 h-3 text-amber-400" />}
                    {att.type === 'file' && <FileText className="w-3 h-3 text-emerald-400" />}
                    <span className="max-w-[120px] truncate">{att.name}</span>
                    <button
                      onClick={() => setPendingAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-0.5 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Chat Action Toolbar & Input Area */}
            <div className="bg-slate-950/95 border-t border-slate-800 p-3 space-y-2.5">
              {/* Media Action Buttons Bar */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 no-scrollbar">
                <div className="flex items-center gap-1.5">
                  {/* Datei Upload */}
                  <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono cursor-pointer transition">
                    <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Datei</span>
                    <input type="file" onChange={(e) => handleChatFileUpload(e, 'file')} className="hidden" />
                  </label>

                  {/* Foto / Screenshot Upload */}
                  <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono cursor-pointer transition">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Foto / Screenshot</span>
                    <input type="file" accept="image/*" onChange={(e) => handleChatFileUpload(e, 'image')} className="hidden" />
                  </label>

                  {/* Notiz Button */}
                  <button
                    onClick={() => setShowNoteModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono cursor-pointer transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Notiz</span>
                  </button>

                  {/* Audio-Sprachnachricht Record Button */}
                  <button
                    onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-mono cursor-pointer transition ${
                      isRecordingVoice
                        ? 'bg-red-950 border-red-500 text-red-200 animate-pulse'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-300'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isRecordingVoice ? `Aufnahme (${voiceSeconds}s)...` : 'Audio'}</span>
                  </button>
                </div>

                {/* Speak-to-Text Dictation Toggle */}
                <button
                  onClick={toggleSpeechRecognition}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer shrink-0 ${
                    isListeningSpeech
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-200 animate-pulse font-bold'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-400'
                  }`}
                  title="Speak-to-Text: Direkt per Sprache diktieren"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isListeningSpeech ? 'Hört zu...' : 'Diktieren'}</span>
                </button>
              </div>

              {/* Message Input & Send Button */}
              <div className="flex items-end gap-2">
                <textarea
                  rows={2}
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Schreibe an PI (alle Anhänge und Texte werden verarbeitet & im Tagebuch verankert)..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                />

                <button
                  disabled={chatSending || isKilled || (!chatInputText.trim() && pendingAttachments.length === 0)}
                  onClick={handleSendMessage}
                  className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition cursor-pointer disabled:opacity-40 shrink-0"
                >
                  {chatSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 fill-slate-950" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── TAB 2: PI TAGEBUCH & GEDANKEN ──────────────── */}
        {activeTab === 'diary' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-mono font-bold text-white">PI TAGEBUCH &amp; GEDANKEN-LOGBUCH</h2>
                    <p className="text-xs text-slate-400 font-mono">
                      150 Jahre Wissenssammlung · &quot;Teile was du weißt, behalte es nicht für dich.&quot;
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddThoughtModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Gedanke verankern</span>
                </button>
              </div>

              {/* Journal List */}
              <div className="space-y-3 max-h-[68vh] overflow-y-auto pr-1">
                {journalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 hover:border-cyan-900/60 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-bold">
                          {entry.theme}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(entry.timestamp).toLocaleString('de-DE')}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">
                        Kohärenz: {(entry.coherenceScore * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-200 leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
                      <p className="font-semibold text-cyan-300 mb-1">💡 PI Gedanke:</p>
                      <p>{entry.thought}</p>
                    </div>

                    {entry.lessonLearned && (
                      <p className="text-[11px] text-slate-400 font-mono pt-1">
                        ↳ Verankertes Wissen: {entry.lessonLearned}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── TAB: PI BUILD APK STUDIO ──────────────── */}
        {activeTab === 'apk' && <PIBuildAPKStudio />}

        {/* ──────────────── TAB 3: 0-TOOLS (9 CORE MODULES) ──────────────── */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'AnalyseText', label: 'Verstehen', icon: Cpu, sub: 'Fakten/Logik' },
                { id: 'AnalyseImage', label: 'Sehen', icon: Eye, sub: 'OCR / Bild' },
                { id: 'TranscribeAudio', label: 'Hören', icon: Mic, sub: '432Hz Audio' },
                { id: 'AnalyseCode', label: 'Prüfen', icon: Code2, sub: 'Code Syntax' },
                { id: 'SetReminder', label: 'Handeln', icon: Bell, sub: 'Timer' },
                { id: 'ReceiveVoiceMail', label: 'Hafen-Mail', icon: Mail, sub: 'Sprachbox' },
                { id: 'SearchWeb', label: 'Recherche', icon: Globe, sub: 'Erlaubnis' },
                { id: 'AnonymizeSensitiveInfo', label: 'Sichern', icon: Shield, sub: 'PII Schutz' },
                { id: 'AddToLearningPool', label: 'Lernen', icon: Layers, sub: 'Feintuning' },
              ].map((tool) => {
                const Icon = tool.icon;
                const isSelected = selectedToolId === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedToolId(tool.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition cursor-pointer text-center ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-semibold leading-tight">{tool.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{tool.sub}</span>
                  </button>
                );
              })}
            </div>

            {/* Tool Active Box */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <h2 className="text-sm font-mono font-bold text-white tracking-wide">
                    TOOL: {selectedToolId.toUpperCase()}
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/80">
                  0-Entropie Modus
                </span>
              </div>

              {/* Specific Tool Inputs */}
              {selectedToolId === 'AnalyseImage' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Lade ein Bild, Screenshot oder Code-Dokument hoch zur reinen Vektor- und Strukturanalyse:
                  </p>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-200 cursor-pointer">
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>Datei wählen</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            setToolFile({ name: file.name, type: file.type, base64: reader.result as string });
                            showToast(`Datei "${file.name}" geladen`);
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-400 font-mono truncate">
                      {toolFile ? toolFile.name : 'Keine Datei ausgewählt'}
                    </span>
                  </div>
                  {toolFile?.base64 && (
                    <div className="w-full max-h-40 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                      <img src={toolFile.base64} alt="Upload Vorschau" className="max-h-40 object-contain" />
                    </div>
                  )}
                </div>
              )}

              {selectedToolId === 'SearchWeb' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-200 text-xs font-mono space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Sicherheitskontrolle (Bauplan Regel #9):</span>
                    </div>
                    <p className="text-slate-300">
                      Live-Internet-Recherche darf nur mit ausdrücklicher Erlaubnis der Missgiver Patricia erfolgen.
                    </p>
                    <label className="flex items-center gap-2 pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webSearchPermitted}
                        onChange={(e) => setWebSearchPermitted(e.target.checked)}
                        className="rounded border-amber-500 text-amber-500 focus:ring-0"
                      />
                      <span className="text-amber-300 font-bold">Ich erlaube PI diese Live-Recherche.</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={toolInputText}
                    onChange={(e) => setToolInputText(e.target.value)}
                    placeholder="Suchbegriff eingeben..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              )}

              {selectedToolId !== 'AnalyseImage' && selectedToolId !== 'SearchWeb' && (
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-mono">Eingabe:</label>
                  <textarea
                    rows={4}
                    value={toolInputText}
                    onChange={(e) => setToolInputText(e.target.value)}
                    placeholder="Eingabe für das Tool..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none leading-relaxed"
                  />
                </div>
              )}

              <button
                disabled={executingTool || isKilled}
                onClick={executeTool}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-[0.99] disabled:opacity-50"
              >
                {executingTool ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-950" />}
                <span>WERKZEUG AUSFÜHREN</span>
              </button>
            </div>

            {/* Last Result Card */}
            {lastResult && (
              <div className="bg-slate-900/70 border border-cyan-900/50 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      ERGEBNIS: {lastResult.tool}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{lastResult.timestamp}</span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 overflow-x-auto max-h-60 leading-relaxed whitespace-pre-wrap">
                  {typeof lastResult.data === 'string' ? lastResult.data : JSON.stringify(lastResult.data, null, 2)}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400 font-mono">Ergebnis verwalten:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUserChoice('save')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 text-xs font-mono cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Speichern</span>
                    </button>
                    <button
                      onClick={() => handleUserChoice('share')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Teilen</span>
                    </button>
                    <button
                      onClick={() => handleUserChoice('delete')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-900/60 text-xs font-mono cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Löschen</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──────────────── TAB 4: TRANSFORMER STUDIO ──────────────── */}
        {activeTab === 'transformer' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                    <Binary className="w-4 h-4 text-cyan-400" />
                    TRANSFORMER 0-LOGIK STUDIO
                  </h2>
                  <p className="text-xs text-slate-400">
                    Modell-Feintuning für LLaMA-3, Mistral, Qwen und Phi-3 mit 0-Entropy Loss.
                  </p>
                </div>
                <button
                  onClick={runTrainingStep}
                  disabled={trainingInProgress || isKilled}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {trainingInProgress ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
                  <span>Trainingsschritt</span>
                </button>
              </div>

              {/* Model Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400">Aktives Open-Source Basismodell:</label>
                <select
                  value={transformerConfig.activeModel}
                  onChange={(e) => setTransformerConfig({ ...transformerConfig, activeModel: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="LLaMA-3-8B-0Logic-LoRA">LLaMA 3 (8B) — 0-Logic LoRA Edition</option>
                  <option value="Mistral-7B-v0.3-Zero">Mistral 7B v0.3 — Zero Equilibrium</option>
                  <option value="Qwen-2.5-7B-Instruct-0Logik">Qwen 2.5 (7B) — Multilingual 0-Matrix</option>
                  <option value="Phi-3.5-mini-0Logic">Phi-3.5 Mini (3.8B) — Motorola 13 Optimized</option>
                </select>
              </div>

              {/* Parameter Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">LoRA Rank (r):</span>
                    <span className="text-cyan-400 font-bold">{transformerConfig.loraRank}</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={64}
                    step={4}
                    value={transformerConfig.loraRank}
                    onChange={(e) => setTransformerConfig({ ...transformerConfig, loraRank: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">LoRA Alpha:</span>
                    <span className="text-cyan-400 font-bold">{transformerConfig.loraAlpha}</span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={128}
                    step={8}
                    value={transformerConfig.loraAlpha}
                    onChange={(e) => setTransformerConfig({ ...transformerConfig, loraAlpha: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Lernrate:</span>
                    <span className="text-cyan-400 font-bold">{transformerConfig.learningRate}</span>
                  </div>
                  <input
                    type="range"
                    min={0.00001}
                    max={0.0005}
                    step={0.00001}
                    value={transformerConfig.learningRate}
                    onChange={(e) => setTransformerConfig({ ...transformerConfig, learningRate: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Temperatur (0.0):</span>
                    <span className="text-cyan-400 font-bold">{transformerConfig.temperature.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={0.7}
                    step={0.05}
                    value={transformerConfig.temperature}
                    onChange={(e) => setTransformerConfig({ ...transformerConfig, temperature: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-mono font-bold text-white flex items-center justify-between">
                <span>KONVERGENZ-VERLAUF</span>
                <span className="text-cyan-400">{trainingMetrics.length} Messpunkte</span>
              </h3>

              <div className="space-y-2">
                {trainingMetrics.slice(-4).reverse().map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-cyan-300 font-bold">Schritt #{m.step}</span>
                      <span className="text-slate-500 text-[10px] ml-2">Loss: {m.loss}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 text-[11px]">Ego: {m.egoScore}</span>
                      <span className="text-emerald-400 font-bold text-[11px]">
                        Resonanz: {(m.coherence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 0-Logik vs Standard-Loss Graphic Comparison Benchmark */}
            <TrainingPerformanceBenchmark />
          </div>
        )}

        {/* ──────────────── TAB 5: SYSTEM (KORTEX, MOTOROLA, GUARDIAN) ──────────────── */}
        {activeTab === 'system' && (
          <div className="space-y-4">
            {/* Subtab Bar */}
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 font-mono text-xs">
              <button
                onClick={() => setSystemSubTab('kortex')}
                className={`py-1.5 rounded-lg transition ${
                  systemSubTab === 'kortex' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/80' : 'text-slate-400'
                }`}
              >
                Kortex Speicher
              </button>
              <button
                onClick={() => setSystemSubTab('motorola')}
                className={`py-1.5 rounded-lg transition ${
                  systemSubTab === 'motorola' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/80' : 'text-slate-400'
                }`}
              >
                Motorola 13 APK
              </button>
              <button
                onClick={() => setSystemSubTab('security')}
                className={`py-1.5 rounded-lg transition ${
                  systemSubTab === 'security' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/80' : 'text-slate-400'
                }`}
              >
                Guardian &amp; Kill
              </button>
            </div>

            {/* Subview: Kortex */}
            {systemSubTab === 'kortex' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    KORTEX DATENBANK ({kortexEntries.length} Einträge)
                  </h2>
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(kortexEntries, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `pi_kortex_export_${Date.now()}.json`;
                      a.click();
                      showToast('Kortex exportiert.');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>JSON Export</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Kortex nach Begriffen durchsuchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {kortexEntries
                    .filter((item) => !searchQuery || item.content.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item) => (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                            {item.category}
                          </span>
                          <button
                            onClick={async () => {
                              await fetch(`/api/kortex/${item.id}`, { method: 'DELETE' });
                              showToast('Eintrag gelöscht.');
                              fetchAllData();
                            }}
                            className="p-1 text-slate-500 hover:text-red-400 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-200 font-mono leading-relaxed">{item.content}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Subview: Motorola 13 */}
            {systemSubTab === 'motorola' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-sm font-mono font-bold text-white">MOTOROLA 13 INSTALLATION &amp; APK</h2>
                    <p className="text-xs text-slate-400 font-mono">App ID: com.missgiver.pi0logik · Standalone</p>
                  </div>
                </div>

                {/* Error Analysis Box */}
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs font-mono space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Ursache für &quot;Beim Parsen des Pakets ist ein Problem aufgetreten&quot;:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Androids nativer Paket-Installer kann nur binäre APKs entpacken, die mit Java/Kotlin und dem Android-SDK kompiliert wurden (<code className="text-cyan-300">classes.dex</code> + <code className="text-cyan-300">AndroidManifest.xml</code>). Ein direkter Webseiten-Download ohne Gradle-Kompilierung wird von Android aus Sicherheitsgründen abgewiesen.
                  </p>
                </div>

                {/* Direct Native Installation (Recommended for Motorola 13) */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/60 to-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Empfohlene Lösung: Native WebAPK auf Motorola 13
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      Kein Parse-Fehler
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    Dein Browser (Brave / Chrome) baut auf deinem Motorola 13 automatisch ein <strong>echtes, signiertes Android-Paket (WebAPK)</strong> zusammen. Die App landet direkt im Motorola App-Menü und läuft ohne Browser-Rahmen.
                  </p>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
                    <p className="font-bold text-white">So installierst du es in 2 Schritten:</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                      <li>
                        Tippe in deinem Browser oben oder unten auf die <strong>3 Punkte (Menü ⋮)</strong>.
                      </li>
                      <li>
                        Wähle im Menü den Punkt <strong>&quot;App installieren&quot;</strong> (oder <strong>&quot;Zum Startbildschirm hinzufügen&quot;</strong>).
                      </li>
                      <li>
                        Bestätige mit <strong>Installieren</strong>.
                      </li>
                    </ol>
                  </div>
                </div>

                {/* GitHub Actions & Real Android Project Package */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Kompiliertes APK via GitHub Actions Build</span>
                  </div>
                  <p className="leading-relaxed">
                    Für eine klassische eigenständige <code className="text-cyan-300">.apk</code>-Datei ist im Repository der GitHub Workflow <code className="text-cyan-300">.github/workflows/release-apk.yml</code> eingerichtet. Sobald du das Projekt auf GitHub pushst, baut GitHub Actions mit Java 17 und Gradle automatisch ein signiertes Release-APK für Motorola 13.
                  </p>
                </div>
              </div>
            )}

            {/* Subview: Guardian & Kill-Switch */}
            {systemSubTab === 'security' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h2 className="text-sm font-mono font-bold text-white">GUARDIAN INTEGRITÄT</h2>
                      <p className="text-xs text-slate-400 font-mono">150-Jahre Lebenszeitfenster</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    AKTIV
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/60 space-y-3">
                  <span className="text-xs font-mono text-red-300 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Kill-Switch Phrase (Patricia):
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="PI SCHLAFENLEGT NULL"
                      value={killPhraseInput}
                      onChange={(e) => setKillPhraseInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-red-900/80 rounded-xl px-3 py-2 text-xs font-mono text-red-200 focus:outline-none"
                    />
                    <button
                      onClick={triggerKillSwitch}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs cursor-pointer"
                    >
                      Kill-Switch
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Quick Note Attachment Modal ── */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-3 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                Notiz an den Chat anhängen
              </h3>
              <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Titel der Notiz..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <textarea
              rows={4}
              placeholder="Notiz-Inhalt..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono cursor-pointer"
              >
                Anhängen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Manual Thought to PI Diary Modal ── */}
      {showAddThoughtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-cyan-800/80 p-5 shadow-2xl space-y-3 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Gedanken im PI Tagebuch verankern
              </h3>
              <button onClick={() => setShowAddThoughtModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Thema (z.B. Wissensweitergabe)..."
              value={newThoughtTheme}
              onChange={(e) => setNewThoughtTheme(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <textarea
              rows={4}
              placeholder="Formuliere den logischen Gedanken / die Erkenntnis für das Tagebuch..."
              value={newThoughtText}
              onChange={(e) => setNewThoughtText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddThoughtModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAddManualThought}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs font-mono cursor-pointer"
              >
                Im Kortex verankern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mandatory User Choice Modal (Speichern, Teilen, Löschen) ── */}
      {userChoiceModal && lastResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-cyan-500/50 p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-2.5">
              <Info className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-mono font-bold text-white">Ergebnis verarbeitet</h3>
                <p className="text-xs text-cyan-300 font-mono">Tool: {lastResult.tool}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
              „Möchtest du das Ergebnis im Wissens-Pool speichern, teilen oder unwiderruflich löschen?“
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => handleUserChoice('save')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/60 text-cyan-300 text-xs font-mono font-bold cursor-pointer"
              >
                <Save className="w-4 h-4 mb-1" />
                <span>Speichern</span>
              </button>

              <button
                onClick={() => handleUserChoice('share')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold cursor-pointer"
              >
                <Share2 className="w-4 h-4 mb-1" />
                <span>Teilen</span>
              </button>

              <button
                onClick={() => handleUserChoice('delete')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-mono font-bold cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mb-1" />
                <span>Löschen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile-First Bottom Navigation Bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5">
        <div className="max-w-md mx-auto grid grid-cols-6 gap-0.5">
          {[
            { id: 'apk', label: 'Build/Git', icon: Zap },
            { id: 'chat', label: 'Chat', icon: MessageSquare },
            { id: 'diary', label: 'Tagebuch', icon: BookOpen },
            { id: 'tools', label: '0-Tools', icon: Cpu },
            { id: 'transformer', label: 'Studio', icon: Sliders },
            { id: 'system', label: 'System', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition cursor-pointer ${
                  isActive ? 'text-cyan-400 bg-cyan-950/60 font-bold' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-[10px] font-mono mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
