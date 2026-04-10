User (Alice) ──┐
               ├── Conversation (Alice-Bob Chat) ──┐
User (Bob)   ──┘                                   ├── Message 1 ("Hello")
                                                   ├── Message 2 ("Hi")
User (Charlie) ──┐                                 └── Message 3 ("How are you?")
                 ├── Conversation (Group Chat)
User (David)   ──┘




======================================================================================================================================================================================================================================

═══════════════════════════════════════════════════════════════════════════════
                    HOW DATA FLOWS THROUGH EACH SCHEMA
═══════════════════════════════════════════════════════════════════════════════

USER SCHEMA (Identity & Presence)
┌────────────────────────────────────────────────────────────────────────────┐
│ {                                                                          │
│   _id: ObjectId("60d5f9f8b8e5a72d4c8e1234"),  ◄── Unique identifier      │
│   phoneNumber: "+919876543210",                 ◄── Login method          │
│   username: "AliceWonder",                      ◄── Display name          │
│   email: "alice@example.com",                   ◄── Verification          │
│   emailOtp: "482917",                           ◄── Temp verification     │
│   emailOtpExpiry: ISODate("2026-04-10T15:00:00Z"),                         │
│   profilePicture: "https://cdn.com/alice.jpg",  ◄── Avatar URL            │
│   about: "Tech enthusiast 📱",                  ◄── Bio                   │
│   lastseen: ISODate("2026-04-10T14:30:00Z"),    ◄── Last activity         │
│   isOnline: true,                               ◄── Real-time status      │
│   isVerified: true,                             ◄── Verified badge        │
│   agreed: true,                                 ◄── Terms accepted        │
│   createdAt: ISODate("2026-04-01T10:00:00Z"),                             │
│   updatedAt: ISODate("2026-04-10T14:30:00Z")                               │
│ }                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ references
                                      ▼
CONVERSATION SCHEMA (Chat Thread)
┌────────────────────────────────────────────────────────────────────────────┐
│ {                                                                          │
│   _id: ObjectId("60d5f9f8b8e5a72d4c8e5678"),  ◄── Room identifier         │
│   participants: [                             ◄── Who's in chat           │
│     ObjectId("60d5f9f8b8e5a72d4c8e1234"),  ◄── Alice                      │
│     ObjectId("60d5f9f8b8e5a72d4c8e5679")   ◄── Bob                        │
│   ],                                                                       │
│   lastMessage: ObjectId("60d5f9f8b8e5a72d4c8e9999"), ◄── Latest message   │
│   unreadCount: 1,                             ◄── Bob's unread count      │
│   createdAt: ISODate("2026-04-05T12:00:00Z"),                             │
│   updatedAt: ISODate("2026-04-10T14:30:00Z")  ◄── Last message time       │
│ }                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ contains
                                      ▼
MESSAGE SCHEMA (Individual Messages)
┌────────────────────────────────────────────────────────────────────────────┐
│ {                                                                          │
│   _id: ObjectId("60d5f9f8b8e5a72d4c8e9999"),  ◄── Message ID               │
│   conversation: ObjectId("60d5f9f8b8e5a72d4c8e5678"), ◄── Parent chat      │
│   sender: ObjectId("60d5f9f8b8e5a72d4c8e1234"),   ◄── Alice                │
│   receiver: ObjectId("60d5f9f8b8e5a72d4c8e5679"), ◄── Bob                  │
│   content: "Hello Bob! 📱",                      ◄── Actual message        │ 
│   imageOrVideoUrl: null,                         ◄── Media (if any)        │
│   contentType: "text",                           ◄── Type of message       │
│   reactions: [                                   ◄── Emoji reactions       │
│     {                                                                      │
│       user: ObjectId("60d5f9f8b8e5a72d4c8e5679"), ◄── Bob reacted          │
│       emoji: "👍"                                                         │
│     }                                                                      │
│   ],                                                                       │
│   messageStatus: "delivered",                    ◄── Delivery status       │
│   createdAt: ISODate("2026-04-10T14:30:00Z"),    ◄── Send time             │ 
│   updatedAt: ISODate("2026-04-10T14:30:05Z")     ◄── Read/delivered time   │
│ }                                                                           │
└────────────────────────────────────────────────────────────────────────────┘

STATUS SCHEMA (Stories - Separate Feature)
┌────────────────────────────────────────────────────────────────────────────┐
│ {                                                                          │
│   _id: ObjectId("60d5f9f8b8e5a72d4c8e7777"),                               │
│   user: ObjectId("60d5f9f8b8e5a72d4c8e1234"),   ◄── Alice's story         │
│   content: "https://cdn.com/alice_story.jpg",    ◄── Image/Video URL      │
│   contentType: "image",                          ◄── Media type           │
│   viewers: [                                     ◄── Who viewed           │
│     ObjectId("60d5f9f8b8e5a72d4c8e5679")         ◄── Bob viewed           │
│   ],                                                                       │
│   expiresAt: ISODate("2026-04-11T14:30:00Z"),    ◄── Auto-delete in 24h   │
│   createdAt: ISODate("2026-04-10T14:30:00Z"),                             │
│   updatedAt: ISODate("2026-04-10T14:35:00Z")                               │
│ }                                                                            │
└────────────────────────────────────────────────────────────────────────────┘