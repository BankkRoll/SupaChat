"use client";

import { AdminPanel } from "@/components/supachat/admin-panel";
import { ChatWidget } from "@/components/supachat/chat-widget";
import { EmojiPicker } from "@/components/supachat/emoji-picker";
import { FileUploadButton } from "@/components/supachat/file-upload";
import { MessageBubble } from "@/components/supachat/message-bubble";
import { TypingIndicator } from "@/components/supachat/typing-indicator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { defaultConfig } from "@/lib/supachat/config";

export default function ComponentShowcase() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="flex justify-center">
        <ChatWidget />
      </div>
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Live Component Showcase
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            These are the real components that are used in the SupaChat widget.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Message Bubble</CardTitle>
              <CardDescription>
                Reusable message display with file support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageBubble
                message={{
                  id: "1",
                  roomId: "1",
                  content: "Hello from SupaChat!",
                  messageType: "text",
                  isFromAdmin: true,
                  createdAt: new Date().toISOString(),
                }}
                isOwnMessage={false}
                adminAvatar={defaultConfig.adminAvatar}
                userAvatar={defaultConfig.userAvatar}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Typing Indicator</CardTitle>
              <CardDescription>
                Animated typing indicator with avatar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TypingIndicator
                isTyping
                showAvatar
                adminAvatar={defaultConfig.adminAvatar}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upload & Emoji</CardTitle>
              <CardDescription>
                File upload and emoji picker components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <FileUploadButton onFileSelect={async () => {}} />
                <EmojiPicker onSelect={() => {}} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>
                Complete admin interface for conversation management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-screen overflow-hidden rounded-lg border">
                <AdminPanel />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
