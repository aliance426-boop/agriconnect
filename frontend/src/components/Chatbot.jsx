import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Plus, Trash2, Bot, User, Menu, X } from 'lucide-react';
import { chatbotService } from '../services/api';
import toast from 'react-hot-toast';

const Chatbot = ({ conversations, onConversationUpdate }) => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef(null);
  const conversationsScrollRef = useRef(null);
  const sidebarScrollRef = useRef(null);
  const messagesScrollRef = useRef(null);

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

  // Gérer le body scroll sur mobile
  useEffect(() => {
    if (showSidebar && window.innerWidth <= 640) {
      document.body.classList.add('chatbot-open');
    } else {
      document.body.classList.remove('chatbot-open');
    }
    return () => {
      document.body.classList.remove('chatbot-open');
    };
  }, [showSidebar]);

  return (
    <div className="chatbot-container h-[calc(100vh-280px)] sm:h-[600px] min-h-[400px] flex flex-col sm:flex-row bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 relative">
      {/* Backdrop pour mobile */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[100] sm:hidden"
          onClick={() => setShowSidebar(false)}
          style={{ touchAction: 'none' }}
        />
      )}
      
      {/* Sidebar - Conversations */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} sm:flex w-full sm:w-80 md:w-96 border-r border-gray-200 dark:border-gray-700 flex-col fixed sm:relative z-[110] sm:z-auto bg-white dark:bg-gray-800 h-full sm:h-auto shadow-lg sm:shadow-none`} style={{ 
        top: showSidebar ? 0 : 'auto',
        left: showSidebar ? 0 : 'auto',
        right: 'auto',
        bottom: 0,
        height: showSidebar ? '100vh' : 'auto',
        maxHeight: showSidebar ? '100vh' : 'auto',
        width: showSidebar ? '100%' : 'auto'
      }}>
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Conversations
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateConversation}
                className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                title="Nouvelle conversation"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:hidden transition-colors"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div 
          ref={conversationsScrollRef}
          className="flex-1 overflow-y-scroll scrollbar-hide"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
            minHeight: 0,
            position: 'relative'
          }}
        >
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-sm sm:text-base">Aucune conversation</p>
              <p className="text-xs sm:text-sm">Créez votre première conversation</p>
            </div>
          ) : (
            <div className="space-y-1.5 p-2 sm:p-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    setShowSidebar(false);
                  }}
                  className={`p-3 sm:p-3.5 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?._id === conversation._id
                      ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white truncate">
                        {conversation.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {conversation.messages.length} message{conversation.messages.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation._id);
                      }}
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0 bg-white dark:bg-gray-800">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {selectedConversation.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  Conseiller agricole IA spécialisé Burkina Faso
                </p>
              </div>
              <button
                onClick={() => setShowSidebar(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg sm:hidden ml-2 flex-shrink-0"
                title="Ouvrir les conversations"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              className="flex-1 overflow-y-scroll p-2 sm:p-4 space-y-3 sm:space-y-4 scrollbar-hide bg-white dark:bg-gray-800"
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
                touchAction: 'pan-y',
                minHeight: 0,
                position: 'relative'
              }}
            >
              {selectedConversation.messages.length === 0 ? (
                <div className="text-center py-4 sm:py-8 px-2">
                  <Bot className="w-12 h-12 sm:w-16 sm:h-16 text-primary-400 mx-auto mb-3 sm:mb-4" />
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Bienvenue dans votre conseiller IA !
                  </h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 px-2">
                    Posez vos questions sur l'agriculture au Burkina Faso
                  </p>
                  
                  {/* Quick Questions */}
                  <div className="space-y-2 px-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Questions rapides :</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {quickQuestions.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickQuestion(question)}
                          className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 sm:px-3 py-1.5 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors break-words max-w-full"
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
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} px-1 sm:px-0`}
                  >
                    <div
                      className={`max-w-[90%] xs:max-w-[85%] sm:max-w-xs md:max-w-md lg:max-w-lg px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg break-words ${
                        message.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === 'ai' && (
                          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mt-0.5 sm:mt-1 flex-shrink-0" />
                        )}
                        {message.role === 'user' && (
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white mt-0.5 sm:mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                            {message.content}
                            {message.streaming && !message.content && (
                              <span className="inline-flex space-x-1">
                                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                              </span>
                            )}
                          </p>
                          {!message.streaming && message.content && (
                            <p className={`text-xs mt-1.5 sm:mt-2 ${
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
            <div className="p-2 sm:p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Posez votre question..."
                  className="flex-1 input-field text-sm sm:text-base min-w-0"
                  disabled={isStreaming}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isStreaming}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed p-2 sm:px-4 flex-shrink-0"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 bg-white dark:bg-gray-800">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
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


