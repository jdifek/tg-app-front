//@ts-nocheck
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Send,
  MessageCircle,
  User,
  Image,
  Video,
  FileText,
  Upload,
  X,
} from "lucide-react";

export default function AdminSupportPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchChats();
    
    // Проверяем URL параметр для автовыбора пользователя
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('user');
    
    const interval = setInterval(fetchChats, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Автовыбор пользователя из URL
    if (chats.length > 0 && !selectedChat) {
      const params = new URLSearchParams(window.location.search);
      const userId = params.get('user');
      
      if (userId) {
        const chat = chats.find(c => c.telegramId === userId);
        if (chat) {
          setSelectedChat(chat);
        }
      }
    }
  }, [chats]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.telegramId);
      const interval = setInterval(
        () => fetchMessages(selectedChat.telegramId),
        5000
      );
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/support/chats");
      const data = await response.json();
      setChats(data);

      const unread = data.filter((chat) => chat.unreadCount > 0).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await fetch(`/api/support/messages/${userId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadMedia = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");

    const data = await response.json();
    return data.url;
  };

  const getMediaType = (file) => {
    if (file.type.startsWith("image/")) return "photo";
    if (file.type.startsWith("video/")) return "video";
    return "document";
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !mediaFile) || !selectedChat) return;

    setSending(true);
    try {
      let mediaUrl = null;
      let mediaType = null;

      if (mediaFile) {
        mediaUrl = await uploadMedia(mediaFile);
        mediaType = getMediaType(mediaFile);
      }

      const response = await fetch("/api/support/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedChat.telegramId,
          message: newMessage.trim(),
          mediaUrl,
          mediaType,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        removeMedia();
        await fetchMessages(selectedChat.telegramId);
        await fetchChats();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMediaPreview = () => {
    if (!mediaPreview) return null;

    const isImage = mediaFile.type.startsWith("image/");
    const isVideo = mediaFile.type.startsWith("video/");

    return (
      <div className="relative inline-block mb-2">
        {isImage && (
          <img
            src={mediaPreview}
            alt="Preview"
            className="max-w-xs max-h-32 rounded-lg"
          />
        )}
        {isVideo && (
          <video
            src={mediaPreview}
            className="max-w-xs max-h-32 rounded-lg"
            controls
          />
        )}
        {!isImage && !isVideo && (
          <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-2">
            <FileText className="w-6 h-6" />
            <span className="text-sm">{mediaFile.name}</span>
          </div>
        )}
        <button
          onClick={removeMedia}
          className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 hover:bg-red-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      <div className="max-w-7xl mx-auto p-4 h-screen flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <MessageCircle className="w-6 h-6" />
            <span>Support Chat</span>
            {unreadCount > 0 && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <div className="w-24" />
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          <div className="w-80 bg-gray-900 bg-opacity-50 rounded-xl border border-gray-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h2 className="font-semibold">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  No conversations yet
                </div>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.telegramId}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full p-4 border-b border-gray-800 hover:bg-gray-800 transition-colors text-left ${
                      selectedChat?.telegramId === chat.telegramId
                        ? "bg-gray-800"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-purple-400" />
                        <span className="font-semibold">
                          {chat.firstName} {chat.lastName}
                        </span>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    {chat.username && (
                      <p className="text-xs text-gray-400 mb-1">
                        @{chat.username}
                      </p>
                    )}
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-400 truncate">
                        {chat.lastMessage.isFromAdmin ? "You: " : ""}
                        {chat.lastMessage.message || "[Media]"}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedChat ? (
            <div className="flex-1 bg-gray-900 bg-opacity-50 rounded-xl border border-gray-800 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <User className="w-8 h-8 text-purple-400" />
                  <div>
                    <h3 className="font-semibold">
                      {selectedChat.firstName} {selectedChat.lastName}
                    </h3>
                    {selectedChat.username && (
                      <a
                        href={`https://t.me/${selectedChat.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:underline"
                      >
                        @{selectedChat.username}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.isFromAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-md rounded-lg p-3 ${
                        msg.isFromAdmin
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 text-gray-100"
                      }`}
                    >
                      {msg.mediaUrl && (
                        <div className="mb-2">
                          {msg.mediaType === "photo" && (
                            <img
                              src={msg.mediaUrl}
                              alt="Media"
                              className="max-w-full rounded-lg"
                            />
                          )}
                          {msg.mediaType === "video" && (
                            <video
                              src={msg.mediaUrl}
                              controls
                              className="max-w-full rounded-lg"
                            />
                          )}
                          {msg.mediaType === "document" && (
                            <a
                              href={msg.mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-blue-300 hover:underline"
                            >
                              <FileText className="w-4 h-4" />
                              <span>View Document</span>
                            </a>
                          )}
                        </div>
                      )}
                      {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                      <p className="text-xs opacity-70 mt-1">
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-800">
                {renderMediaPreview()}
                <div className="flex items-end space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    disabled={sending}
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="2"
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || (!newMessage.trim() && !mediaFile)}
                    className={`p-3 rounded-lg transition-colors ${
                      sending || (!newMessage.trim() && !mediaFile)
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700"
                    }`}
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-gray-900 bg-opacity-50 rounded-xl border border-gray-800 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}