import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Plus, Trash2, Bot, User } from 'lucide-react';
import { chatbotService } from '../services/api';
import toast from 'react-hot-toast';

const Chatbot = ({ conversations, onConversationUpdate }) => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  // Créer automatiquement une conversation par défaut si aucune n'existe
  useEffect(() => {
    const createDefaultConversation = async () => {
      if (conversations.length === 0 && !selectedConversation) {
        try {
          const response = await chatbotService.createConversation('Nouvelle conversation');
          setSelectedConversation(response.data.conversation);
          onConversationUpdate();
        } catch (error) {
          console.error('Erreur lors de la création de la conversation par défaut:', error);
        }
      } else if (conversations.length > 0 && !selectedConversation) {
        setSelectedConversation(conversations[0]);
      }
    };

    createDefaultConversation();
  }, [conversations, selectedConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const userMessage = newMessage;
    setNewMessage('');
    setIsStreaming(true);

    // Ajouter immédiatement le message de l'utilisateur
    const updatedConversation = {
      ...selectedConversation,
      messages: [
        ...selectedConversation.messages,
        {
          role: 'user',
          content: userMessage,
          timestamp: new Date()
        }
      ]
    };
    setSelectedConversation(updatedConversation);

    // Ajouter un message IA vide qui sera rempli progressivement
    const aiMessageIndex = updatedConversation.messages.length;
    const conversationWithAIMessage = {
      ...updatedConversation,
      messages: [
        ...updatedConversation.messages,
        {
          role: 'ai',
          content: '',
          timestamp: new Date(),
          streaming: true // Indicateur que ce message est en cours de streaming
        }
      ]
    };
    setSelectedConversation(conversationWithAIMessage);

    try {
      // Utiliser l'API de streaming
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const eventSource = new EventSource(
        `${apiUrl}/chatbot/conversations/${selectedConversation._id}/messages/stream`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/event-stream'
          }
        }
      );

      // Utiliser fetch avec stream
      const response = await fetch(
        `${apiUrl}/chatbot/conversations/${selectedConversation._id}/messages/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: userMessage })
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.content) {
                accumulatedContent += data.content;
                
                // Mettre à jour le message AI progressivement
                setSelectedConversation(prev => {
                  const newMessages = [...prev.messages];
                  newMessages[aiMessageIndex] = {
                    ...newMessages[aiMessageIndex],
                    content: accumulatedContent
                  };
                  return { ...prev, messages: newMessages };
                });
              }

              if (data.done) {
                // Marquer le message comme terminé
                setSelectedConversation(prev => {
                  const newMessages = [...prev.messages];
                  newMessages[aiMessageIndex] = {
                    ...newMessages[aiMessageIndex],
                    streaming: false
                  };
                  return { ...prev, messages: newMessages };
                });
                // Réinitialiser isStreaming AVANT d'appeler onConversationUpdate
                setIsStreaming(false);
                // Actualiser la conversation complète de manière asynchrone pour éviter le cercle
                setTimeout(() => {
                  onConversationUpdate();
                }, 100);
                break;
              }

              if (data.error) {
                toast.error(data.error);
                break;
              }
            } catch (e) {
              // Ignorer les erreurs de parsing
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'envoi du message');
      // Retirer le message AI vide en cas d'erreur
      setSelectedConversation(updatedConversation);
      setIsStreaming(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      // Générer un titre automatique basé sur le nombre de conversations
      const conversationNumber = conversations.length + 1;
      const title = `Conversation ${conversationNumber}`;
      
      const response = await chatbotService.createConversation(title);
      setSelectedConversation(response.data.conversation);
      onConversationUpdate();
      toast.success('Nouvelle conversation créée');
    } catch (error) {
      toast.error('Erreur lors de la création de la conversation');
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      try {
        await chatbotService.deleteConversation(conversationId);
        if (selectedConversation?._id === conversationId) {
          setSelectedConversation(null);
        }
        onConversationUpdate();
        toast.success('Conversation supprimée');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const quickQuestions = [
    "Quand planter les tomates au Burkina Faso ?",
    "Comment traiter les maladies du riz ?",
    "Quel est le prix actuel du mil ?",
    "Techniques d'irrigation efficaces",
    "Engrais recommandés pour le maïs"
  ];

  const handleQuickQuestion = (question) => {
    setNewMessage(question);
  };

  return (
    <div className="h-[600px] flex bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Sidebar - Conversations */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Conversations
            </h3>
            <button
              onClick={handleCreateConversation}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
              title="Nouvelle conversation"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Aucune conversation</p>
              <p className="text-sm">Créez votre première conversation</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?._id === conversation._id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {conversation.messages.length} messages
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation._id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedConversation.title}
              </h3>
              <p className="text-sm text-gray-600">
                Conseiller agricole IA spécialisé Burkina Faso
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Bienvenue dans votre conseiller IA !
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Posez vos questions sur l'agriculture au Burkina Faso
                  </p>
                  
                  {/* Quick Questions */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Questions rapides :</p>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickQuestion(question)}
                          className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-full hover:bg-primary-100 transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                selectedConversation.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === 'ai' && (
                          <Bot className="w-4 h-4 text-primary-600 mt-1 flex-shrink-0" />
                        )}
                        {message.role === 'user' && (
                          <User className="w-4 h-4 text-white mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                            {message.streaming && !message.content && (
                              <span className="inline-flex space-x-1">
                                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                              </span>
                            )}
                          </p>
                          {!message.streaming && (
                            <p className={`text-xs mt-1 ${
                              message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Posez votre question sur l'agriculture..."
                  className="flex-1 input-field"
                  disabled={isStreaming}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isStreaming}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-600">
                Ou créez une nouvelle conversation pour commencer
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;


