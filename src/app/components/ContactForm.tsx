"use client";

import { useState } from "react";
import Image from "next/image";
import FittingTextarea from "./FittingTextarea";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1773558058134-9ff1a3212ef0?q=80&w=1572&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const canSend = name.trim() && email.trim() && message.trim() && status !== "sending";

  const handleSend = async () => {
    if (!canSend) return;
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setStatus("sent");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const buttonText =
    status === "sending"
      ? "Sending..."
      : status === "sent"
        ? "Email sent :) We will get back to you asap!"
        : status === "error"
          ? "Something went wrong. Try again?"
          : "Send";

  return (
    <section className="relative z-20 w-full bg-background">
      <div className="flex min-h-[10vh] w-full flex-col items-start justify-end bg-background pb-4 pt-8 md:min-h-0 md:pb-6 md:pt-12">
        <h1 className="text-5xl font-light text-foreground">Si hei!</h1>
      </div>

      <div className="relative z-20 min-h-[220px] w-full border-y border-foreground/10 bg-background h-[42vh] max-h-[520px] md:h-[48vh] md:max-h-[600px]">
        <FittingTextarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hva tenker du på?"
          containerClassName="h-full min-h-0"
        />
      </div>

      <div className="w-full flex flex-col md:flex-row gap-2 px-0 py-2">
        <div className="w-full md:w-1/2">
          <label className="sr-only" htmlFor="about-contact-name">
            Name
          </label>
          <input
            id="about-contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full h-fit rounded-full border border-foreground/15 bg-background px-6 py-5 text-lg font-light text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
            autoComplete="name"
          />
        </div>
        <div className="w-full md:w-1/2">
          <label className="sr-only" htmlFor="about-contact-email">
            Email
          </label>
          <input
            id="about-contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full h-fit rounded-full border border-foreground/15 bg-background px-6 py-5 text-lg font-light text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="w-full flex flex-col md:flex-row md:items-stretch gap-2 py-2 p-0 border-b border-foreground/10">
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend && status !== "error"}
          className={[
            "w-full rounded-full md:w-1/2 h-[30vh] md:h-[50vh] flex items-center justify-center border font-light text-2xl md:text-3xl tracking-wide transition-[box-shadow,background-color,color] duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-inset focus:ring-background/30 shrink-0",
            status === "sent"
              ? "border-[var(--comte-muted-green)] bg-[var(--comte-muted-green)] text-[var(--comte-cream)]"
              : status === "error"
                ? "border-[var(--comte-coral)] text-[var(--comte-coral)] hover:cursor-pointer hover:[box-shadow:inset_0_0_100px_0_rgba(242,120,135,0.25)]"
                : status === "sending"
                  ? "border-foreground/30 text-foreground/30 cursor-wait"
                  : "border-foreground text-foreground hover:cursor-pointer hover:[box-shadow:inset_0_0_100px_0_rgba(255,82,82,0.85)]",
          ].join(" ")}
          aria-label="Send message"
        >
          {buttonText}
        </button>
        <div className="flex flex-col gap-1 justify-center text-foreground/70 font-light text-lg px-6 py-8 md:px-0 md:py-0 md:w-1/2">
          <div className="relative overflow-hidden rounded-lg h-full w-full">
            <Image
              src={PLACEHOLDER_IMAGE}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
