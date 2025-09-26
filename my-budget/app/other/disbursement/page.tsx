"use client";

import { useState, useRef } from "react";
import {
  Upload, File, X, Send, FolderOpen, FileText,
  Image, Video, Music, Archive, Check, AlertCircle, Clock
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";

// FileSender Component
function FileSender() {
  const [files, setFiles] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [message, setMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "svg"].includes(extension!)) return Image;
    if (["mp4", "avi", "mov", "wmv"].includes(extension!)) return Video;
    if (["mp3", "wav", "flac", "aac"].includes(extension!)) return Music;
    if (["zip", "rar", "7z", "tar"].includes(extension!)) return Archive;
    if (["pdf", "doc", "docx", "txt"].includes(extension!)) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles: File[]) => {
    const filesWithId = newFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...filesWithId]);
  };

  const removeFile = (fileId: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const addRecipient = (email: string) => {
    if (email && !recipients.includes(email)) {
      setRecipients((prev) => [...prev, email]);
      setRecipientInput("");
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients((prev) => prev.filter((r) => r !== email));
  };

  const handleSendFiles = async () => {
    if (files.length === 0 || recipients.length === 0) return;

    setSendStatus("sending");

    for (let i = 0; i < files.length; i++) {
      const fileId = files[i].id;
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, progress } : f))
        );
      }
    }

    setTimeout(() => {
      setSendStatus("sent");
      setTimeout(() => {
        setSendStatus("idle");
        setFiles([]);
        setRecipients([]);
        setMessage("");
      }, 2000);
    }, 500);
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h2>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-lg font-medium text-gray-900 mb-2">
            Drag and drop files here
          </div>
          <div className="text-gray-600 mb-4">
            or click to browse from your computer
          </div>
          <div className="text-sm text-gray-500">
            Supports: Images, Documents, Videos, Archives (Max: 100MB per file)
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Selected Files ({files.length})
            </h3>
            <div className="text-sm text-gray-600">
              Total size: {formatFileSize(totalSize)}
            </div>
          </div>

          <div className="space-y-3">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.name);
              return (
                <div
                  key={file.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg"
                >
                  <FileIcon className="w-8 h-8 text-blue-600 mr-3" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </div>
                    {sendStatus === "sending" && (
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="ml-2 text-gray-400 hover:text-red-500"
                    disabled={sendStatus === "sending"}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recipients */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">email ผู้รับ</h3>
        <div className="space-y-3">
          <div>
            <input
              type="email"
              placeholder="Enter email address"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") addRecipient(recipientInput);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => addRecipient(recipientInput)}
              className="mt-2 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
            >
              เพิ่ม
            </button>
          </div>

          {recipients.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">
                Recipients ({recipients.length}):
              </div>
              {recipients.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-900">{email}</span>
                  <button
                    onClick={() => removeRecipient(email)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Message (Optional)</h3>
        <textarea
          placeholder="Add a message to your files..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>

      {/* Send Button */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <button
          onClick={handleSendFiles}
          disabled={files.length === 0 || recipients.length === 0 || sendStatus === "sending"}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${
            files.length === 0 || recipients.length === 0 || sendStatus === "sending"
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : sendStatus === "sent"
              ? "bg-green-600 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {sendStatus === "sending" && (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              Sending...
            </>
          )}
          {sendStatus === "sent" && (
            <>
              <Check className="w-5 h-5" />
              Sent Successfully!
            </>
          )}
          {sendStatus === "idle" && (
            <>
              <Send className="w-5 h-5" />
              Send Files
            </>
          )}
          {sendStatus === "error" && (
            <>
              <AlertCircle className="w-5 h-5" />
              Try Again
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ✅ Main Page Component
export default function Disbursement() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden p-6">
          <h1 className="text-2xl font-semibold mb-6">Disbursement</h1>
          {/* Embed FileSender here */}
          <FileSender />
        </div>
      </main>
    </div>
  );
}
