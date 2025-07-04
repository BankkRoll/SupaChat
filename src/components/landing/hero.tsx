"use client";

import { Check, Copy, Star } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const REGISTRY_URL = "https://supachat.site/r/supachat";

const managers = [
  { name: "pnpm", cmd: (url: string) => `pnpm dlx shadcn@latest add ${url}` },
  { name: "npm", cmd: (url: string) => `npx shadcn@latest add ${url}` },
  { name: "yarn", cmd: (url: string) => `yarn dlx shadcn@latest add ${url}` },
];

export default function Hero() {
  const [pm, setPm] = useState(managers[0].name);
  const [copied, setCopied] = useState(false);
  const command = managers.find((m) => m.name === pm)!.cmd(REGISTRY_URL);
  const copy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <section className="relative overflow-hidden pt-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="mx-auto max-w-4xl text-center">
        <Badge variant="secondary" className="mb-4">
          <Star className="w-3 h-3 mr-1" />
          Realtime Support
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          SupaChat
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          Realtime chat system with admin panel, file uploads, emoji support,
          and more.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4">
          <div className="w-full max-w-xl mx-auto">
            <div className="relative flex items-center bg-muted rounded-md font-mono text-sm px-4 py-3">
              <span className="truncate select-all text-left grow">
                {command}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    aria-label="Copy install command"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {managers.map((m) => (
                    <DropdownMenuItem
                      key={m.name}
                      onClick={() => {
                        setPm(m.name);
                        setTimeout(copy, 100);
                      }}
                    >
                      {m.name.charAt(0).toUpperCase() + m.name.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <a
            href="https://github.com/BankkRoll/SupaChat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium shadow hover:bg-primary/90 transition"
          >
            <svg
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.468-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.984-.399 3.003-.404 1.018.005 2.046.138 3.006.404 2.289-1.553 3.295-1.23 3.295-1.23.653 1.653.242 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.804 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.903-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            View source on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
