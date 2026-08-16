/** Floating farmer assistance chatbot, available on every page once signed in. */
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MessageCircle, Send, X, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { askAdvisor } from "@/lib/chat.functions";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How do I prevent blight on tomatoes?",
  "Why are my maize leaves turning yellow?",
  "How should I photograph a leaf for analysis?",
];

const GREETING: Message = {
  role: "assistant",
  content:
    "Hello! I'm your AgriVision assistant. Ask me about crop diseases, pests, soil, irrigation, or how to use this app.",
};

export function FarmChat() {
  const { user } = useAuth();
  const ask = useServerFn(askAdvisor);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  if (!user) return null;

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const next: Message[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { reply } = await ask({ data: { messages: next.slice(-10).filter((m) => m.content) } });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't answer just now. Please try again in a moment." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {open ? (
        <section
          aria-label="Farmer assistant chat"
          className="fixed bottom-24 right-4 z-50 flex h-[70vh] max-h-[560px] w-[min(94vw,380px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl md:bottom-20"
        >
          <header className="flex items-center gap-3 border-b border-border bg-secondary/50 px-4 py-3">
            <span className="gradient-leaf flex size-8 items-center justify-center rounded-lg text-primary-foreground">
              <Sprout className="size-4" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">AgriVision Assistant</p>
              <p className="text-xs text-muted-foreground">Crop help, any time</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Close chat" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </Button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                {message.content}
              </div>
            ))}
            {busy ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Thinking about your crop...
              </div>
            ) : null}
            {messages.length === 1 ? (
              <div className="space-y-2 pt-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="w-full rounded-xl border border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <form
            className="flex items-center gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <label htmlFor="farmchat-input" className="sr-only">
              Ask the assistant
            </label>
            <Input
              id="farmchat-input"
              value={input}
              placeholder="Ask about your crop..."
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
            />
            <Button type="submit" size="icon" aria-label="Send message" disabled={busy || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </section>
      ) : null}

      <Button
        onClick={() => setOpen(true)}
        aria-label="Open farmer assistant chat"
        className={`fixed bottom-20 right-4 z-50 size-14 rounded-full shadow-lg md:bottom-6 ${open ? "hidden" : ""}`}
      >
        <MessageCircle className="size-6" aria-hidden="true" />
      </Button>
    </>
  );
}
