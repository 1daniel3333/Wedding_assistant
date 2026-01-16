
// DO: Add React import to provide the React namespace for FC and ChangeEvent types
import React, { useState, useRef, useEffect } from 'react';
import { Message, AppState } from './types';
import { chatWithAssistant, generateWeddingImage, editWeddingImage } from './services/geminiService';
import { Navbar } from './components/Navbar';
import { ChatBubble } from './components/ChatBubble';
import { ImageGallery } from './components/ImageGallery';

// Fix: Now uses the React namespace provided by the import
const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    messages: [{
      role: 'assistant',
      content: "Welcome to Ethereal Weddings. I'm your photography consultant. To begin visualizing your dream photoshoot, could you please upload a few photos of you and your partner? This helps me understand your unique features for the most accurate visualization."
    }],
    uploadedPhotos: [],
    generatedImages: [],
    isThinking: false,
    step: 'identity',
    apiKey: localStorage.getItem('gemini_api_key') || null
  });

  const [input, setInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, state.isThinking]);

  // Fix: React.ChangeEvent is now correctly resolved
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Explicitly type file as File to avoid inference issues with FileReader.readAsDataURL
    const readers = Array.from(files).map((file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(base64Images => {
      setState(prev => ({
        ...prev,
        uploadedPhotos: [...prev.uploadedPhotos, ...base64Images],
      }));
      // Automatically send a message that images were uploaded
      handleSendMessage(`I've uploaded ${base64Images.length} photos.`, base64Images);
    });
  };

  const parseResponse = async (text: string) => {
    const promptMatch = text.match(/\[VISUAL_PROMPT\]:?\s*([\s\S]*)/i);
    const summaryMatch = text.match(/\[SCENE_SUMMARY\]:?\s*([\s\S]*?)(?=\[VISUAL_PROMPT\]|$)/i);

    if (promptMatch) {
      const visualPrompt = promptMatch[1].trim();
      const sceneSummary = summaryMatch ? summaryMatch[1].trim() : "Generating your visualization...";

      setState(prev => ({ ...prev, isThinking: true }));
      try {
        if (!state.apiKey) throw new Error("API Key missing");
        const imageUrl = await generateWeddingImage(state.apiKey, visualPrompt, state.uploadedPhotos);
        if (imageUrl) {
          setState(prev => ({
            ...prev,
            generatedImages: [imageUrl, ...prev.generatedImages],
            step: 'preview'
          }));
        }
      } catch (error) {
        console.error("Image generation failed", error);
      } finally {
        setState(prev => ({ ...prev, isThinking: false }));
      }
    }
  };

  const handleSendMessage = async (content: string, images?: string[]) => {
    if (!content.trim() && (!images || images.length === 0)) return;

    const userMessage: Message = { role: 'user', content, images };
    const updatedMessages = [...state.messages, userMessage];

    setState(prev => ({
      ...prev,
      messages: updatedMessages,
      isThinking: true
    }));
    setInput('');

    try {
      if (!state.apiKey) throw new Error("API Key missing");
      const responseText = await chatWithAssistant(state.apiKey, updatedMessages, images);
      const assistantMessage: Message = { role: 'assistant', content: responseText };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isThinking: false
      }));

      // Check if we should trigger image generation or if it was an edit request
      if (responseText.includes('[VISUAL_PROMPT]')) {
        await parseResponse(responseText);
      } else if (state.generatedImages.length > 0 && (content.toLowerCase().includes('filter') || content.toLowerCase().includes('change') || content.toLowerCase().includes('add') || content.toLowerCase().includes('remove'))) {
        // Simple heuristic for image editing request
        await handleImageEdit(content);
      }

    } catch (error) {
      console.error("Chat error:", error);
      setState(prev => ({ ...prev, isThinking: false }));
    }
  };

  const handleImageEdit = async (editPrompt: string) => {
    if (state.generatedImages.length === 0) return;

    setState(prev => ({ ...prev, isThinking: true }));
    try {
      const lastImage = state.generatedImages[0];
      if (!state.apiKey) throw new Error("API Key missing");
      const editedImageUrl = await editWeddingImage(state.apiKey, lastImage, editPrompt);
      if (editedImageUrl) {
        setState(prev => ({
          ...prev,
          generatedImages: [editedImageUrl, ...prev.generatedImages]
        }));
      }
    } catch (error) {
      console.error("Image editing failed", error);
    } finally {
      setState(prev => ({ ...prev, isThinking: false }));
    }
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem('gemini_api_key', apiKeyInput.trim());
      setState(prev => ({ ...prev, apiKey: apiKeyInput.trim() }));
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto bg-white shadow-2xl overflow-hidden relative">
      <Navbar />

      {/* API Key Modal */}
      {!state.apiKey && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full space-y-6">
            <div className="text-center">
              <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-key text-rose-500 text-2xl"></i>
              </div>
              <h2 className="text-2xl font-serif text-stone-800">Enter Your API Key</h2>
              <p className="text-stone-500 mt-2">
                ToString start, please enter your Gemini API Key. This ensures you use your own quota for the session.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Gemini API Key</label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKeyInput.trim()}
                className="w-full py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
              >
                Start Helper
              </button>
              <p className="text-xs text-center text-stone-400">
                Your key is stored locally in your browser and never sent to our servers.
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Chat Interface */}
        <section className="flex-1 flex flex-col border-r border-stone-100 bg-stone-50/30">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {state.messages.map((m, idx) => (
              <ChatBubble key={idx} message={m} />
            ))}
            {state.isThinking && (
              <div className="flex justify-start">
                <div className="bg-stone-200 animate-pulse h-10 w-24 rounded-2xl" />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-stone-100">
            <div className="flex items-center gap-2 mb-2">
              {state.uploadedPhotos.length > 0 && (
                <div className="flex gap-1 overflow-x-auto pb-2">
                  {state.uploadedPhotos.map((img, i) => (
                    <img key={i} src={img} className="h-10 w-10 object-cover rounded-md border border-stone-200" alt="Reference" />
                  ))}
                </div>
              )}
            </div>
            <div className="relative flex items-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-3 text-stone-400 hover:text-rose-500 transition-colors"
                title="Upload photos of the couple"
              >
                <i className="fa-solid fa-camera text-xl"></i>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
                placeholder="Talk to your assistant..."
                className="w-full pl-12 pr-16 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
              />
              <button
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim() || state.isThinking}
                className="absolute right-3 px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 disabled:bg-stone-300 transition-colors"
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </section>

        {/* Right Side: Visualization Gallery */}
        <section className="hidden md:flex w-2/5 flex-col bg-stone-50 overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-white flex justify-between items-center">
            <h2 className="text-lg font-semibold text-stone-800">Visual Gallery</h2>
            <span className="text-xs text-stone-400 italic">Previews powered by Gemini</span>
          </div>
          <ImageGallery images={state.generatedImages} onEdit={handleImageEdit} />
        </section>
      </main>
    </div>
  );
};

export default App;
