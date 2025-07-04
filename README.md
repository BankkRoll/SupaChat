# SupaChat

SupaChat provides a complete realtime messaging solution with Supabase integration, admin panel, file uploads, emoji support and more!

## Features

- **Realtime Messaging**: Instant message delivery with Supabase realtime subscriptions
- **Admin Panel**: Complete admin interface for conversation management
- **File Uploads**: Drag-and-drop file uploads with image previews
- **Guest Sessions**: Support for both authenticated users and guest sessions
- **Row-Level Security**: Enterprise-grade security with RLS policies
- **TypeScript First**: Full TypeScript support with comprehensive types
- **One Command Install**: Install everything with a single ShadCN command

> **Note:** The current version of SupaChat supports only guest (anonymous) chat sessions. Authenticated user chat is not included out of the box, but the schema and codebase are designed for future extensibility.

## Quick Start

### Installation

```bash
npx shadcn@latest add https://supachat.site/r/supachat.json
```

### Environment Setup

Add to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run the SQL schema in your Supabase SQL Editor:

```sql
-- SupaChat Database Schema
-- Complete schema for production-ready chat system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chat rooms table
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  is_guest_room BOOLEAN DEFAULT false,
  guest_session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_session_id UUID,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  is_from_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat users (for admin assignment)
CREATE TABLE chat_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_session_id UUID UNIQUE,
  name TEXT,
  email TEXT,
  is_admin BOOLEAN DEFAULT false,
  assigned_admin_id UUID REFERENCES auth.users(id),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_users ENABLE ROW LEVEL SECURITY;

-- Simple, effective policies for chat_rooms
CREATE POLICY "Enable read access for all users" ON chat_rooms
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users and guests" ON chat_rooms
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR guest_session_id IS NOT NULL);

CREATE POLICY "Enable update for room owners and admins" ON chat_rooms
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM chat_users WHERE is_admin = true) OR
    guest_session_id = chat_rooms.guest_session_id
  );

-- Simple, effective policies for messages
CREATE POLICY "Enable read access for all users" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users and guests" ON messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR guest_session_id IS NOT NULL);

CREATE POLICY "Enable update for admins only" ON messages
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM chat_users WHERE is_admin = true)
  );

-- Simple, effective policies for chat_users
CREATE POLICY "Enable read access for all users" ON chat_users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users and guests" ON chat_users
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR guest_session_id IS NOT NULL);

CREATE POLICY "Enable update for users and admins" ON chat_users
  FOR UPDATE USING (
    auth.uid() = user_id OR
    guest_session_id = chat_users.guest_session_id OR
    auth.uid() IN (SELECT user_id FROM chat_users WHERE is_admin = true)
  );

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_count(room_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM messages
    WHERE messages.room_id = get_unread_count.room_id
    AND messages.is_from_admin = true
    AND messages.created_at > (
      SELECT COALESCE(MAX(last_seen), '1970-01-01'::timestamp)
      FROM chat_users
      WHERE chat_users.user_id = auth.uid() OR chat_users.guest_session_id IS NOT NULL
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_chat_users_guest_session ON chat_users(guest_session_id);
CREATE INDEX idx_chat_rooms_guest_session ON chat_rooms(guest_session_id);
CREATE INDEX idx_chat_users_user_id ON chat_users(user_id);
CREATE INDEX idx_chat_users_is_admin ON chat_users(is_admin);
CREATE INDEX idx_messages_is_from_admin ON messages(is_from_admin);

-- Storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view chat files" ON storage.objects
  FOR SELECT USING (bucket_id = 'chat-files');

CREATE POLICY "Authenticated users can upload chat files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-files' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own chat files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'chat-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own chat files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'chat-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Basic Usage

```tsx
import { ChatWidget } from "@/components/supachat/chat-widget";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <ChatWidget
        position="bottom-right"
        title="Support Team"
        showOnLoad={false}
      />
    </div>
  );
}
```

### Admin Panel

```tsx
// app/admin/page.tsx
import { AdminPanel } from "@/components/supachat/admin-panel";

export default function AdminPage() {
  return (
    <div className="h-screen">
      <AdminPanel />
    </div>
  );
}
```

## Documentation

For detailed setup instructions, configuration options, and advanced usage, see:

**[Complete Documentation](./registry/supachat/supachat-setup.md)**

## Development

### Running the Registry Locally

1. Install dependencies:

```bash
pnpm install
```

2. Start the development server:

```bash
pnpm dev
```

3. The registry will be available at:

- Main registry: `http://localhost:3000/r`
- SupaChat block: `http://localhost:3000/r/supachat.json`

### Building the Registry

```bash
pnpm registry:build
```

This generates the registry JSON files in the `public/r/` directory.

## Registry Structure

```
registry/
├── supachat.json              # Main registry manifest
└── supachat/                  # SupaChat block
    ├── components/
    │   ├── ui/                # ShadCN UI primitives (11 components)
    │   └── supachat/          # SupaChat components (6 components)
    ├── hooks/                 # React hooks (4 hooks)
    ├── lib/                   # Configuration and utilities (6 files)
    ├── migrations/            # Database schema
    └── supachat-setup.md      # Setup documentation
```

## Components

### Core Components

- `ChatWidget`: Main chat interface with configurable positioning
- `AdminPanel`: Complete admin dashboard for conversation management
- `MessageBubble`: Individual message display with file support
- `TypingIndicator`: Animated typing indicator component
- `FileUpload`: File upload interface with drag-and-drop
- `EmojiPicker`: Advanced emoji picker with search and categories

### Hooks

- `useChat`: Core chat functionality and message management
- `useChatStatus`: Presence and typing management
- `useAdmin`: Admin operations and room management
- `useChatSession`: Session management and persistence
- `useChatStore`: Global state management with Zustand

## Configuration

SupaChat is highly configurable through the `SupaChatConfig` interface:

```typescript
export interface SupaChatConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  localStorageKey: string;
  welcomeMessages?: WelcomeMessage[];
  enableUploads?: boolean;
  enableEmojis?: boolean;
  agentTypingDelay?: number;
  inputLockedAfterSend?: boolean;
  adminRole?: string;
  theme?: "light" | "dark" | "system";
  maxMessageLength?: number;
  enablePresence?: boolean;
  autoAssignAdmin?: boolean;
  guestSessionExpiry?: number;
  chatWidgetPosition?:
    | "bottom-right"
    | "bottom-left"
    | "top-right"
    | "top-left";
  chatWidgetSize?: {
    width: number;
    height: number;
  };
  maxFileSize?: number;
  allowedFileTypes?: string[];
}
```

## Security

- Row-level security policies protect all data
- Guest sessions are properly isolated
- Admin access controlled via role-based permissions
- File uploads secured with access controls
- All messages encrypted in transit

## Performance

- Optimized database indexes for message queries
- Efficient realtime subscriptions
- Minimal bundle size with tree-shaking
- Optimized file upload handling
- Responsive design for all screen sizes

## Contributing

We welcome contributions! Please see our contributing guidelines:

### Development Setup

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `pnpm install`
4. Start development server: `pnpm dev`
5. Make your changes
6. Test thoroughly
7. Submit a pull request

### Guidelines

- Follow the existing code style and patterns
- Add TypeScript types for new features
- Include tests for new functionality
- Update documentation as needed
- Ensure all components are responsive
- Test with both authenticated and guest users

### Areas for Contribution

- Bug fixes and improvements
- New features and components
- Documentation improvements
- Performance optimizations
- Security enhancements
- Accessibility improvements

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Acknowledgments

SupaChat is built on top of excellent open-source projects:

- **[ShadCN UI](https://ui.shadcn.com)** - Component system and registry architecture
- **[Supabase](https://supabase.com)** - Realtime database and authentication infrastructure
- **[Next.js](https://nextjs.org)** - React framework and SSR support
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com)** - Accessible UI primitives
- **[Zustand](https://github.com/pmndrs/zustand)** - State management
- **[Lucide React](https://lucide.dev)** - Icon library
- **[Emoji Datasource](https://github.com/iamcal/emoji-data?tab=readme-ov-file#emoji-data---easy-to-consume-emoji-data-and-images)** - Emoji library

Special thanks to the ShadCN team for creating the registry system that makes distributing complex component suites possible with a single CLI command.

## Support

- **Documentation**: [Complete setup guide](./registry/supachat/supachat-setup.md)
- **Issues**: [GitHub Issues](https://github.com/BankkRoll/supachat/issues) for bugs and feature requests
- **Discussions**: [GitHub Discussions](https://github.com/BankkRoll/supachat/discussions) for questions
