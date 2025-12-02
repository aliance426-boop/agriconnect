const express = require('express');
const { body, validationResult } = require('express-validator');
const Conversation = require('../models/Conversation');
const { auth } = require('../middleware/auth');
const axios = require('axios');
const config = require('../config');

const router = express.Router();

// Configuration pour l'API Groq (gratuite et rapide)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Prompt système optimisé pour l'agriculture au Burkina Faso
const SYSTEM_PROMPT = `Tu es AgriBot, un expert agricole spécialisé dans l'agriculture au Burkina Faso.

EXPERTISE:
- Cultures principales: mil, sorgho, maïs, riz, niébé, arachide, coton, sésame
- Saisons: saison des pluies (juin-octobre), saison sèche (novembre-mai)
- Régions agricoles: Centre, Nord, Sud-Ouest, Hauts-Bassins
- Défis: sécheresse, érosion, ravageurs (chenilles légionnaires, criquets)

STYLE DE RÉPONSE:
- Concis et pratique
- Adapté au climat sahélien
- Conseils actionnables
- Références aux pratiques locales
- Mentionner les périodes optimales (mois)

Réponds toujours en français de manière claire et professionnelle.`;

// Fonction pour appeler l'API avec contexte conversationnel
const callAIAPI = async (message, conversationHistory = []) => {
  try {
    // Vérifier la clé API
    const apiKey = process.env.GROQ_API_KEY || config.GROQ_API_KEY;
    if (!apiKey) {
      console.error('⚠️ GROQ_API_KEY non configurée');
      return "⚠️ L'IA n'est pas configurée. Veuillez contacter l'administrateur pour configurer la clé API Groq.";
    }

    // Construire l'historique des messages (max 10 derniers pour le contexte)
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Ajouter les derniers messages de la conversation pour le contexte
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      });
    });

    // Ajouter le nouveau message
    messages.push({
      role: 'user',
      content: message
    });

    console.log('🤖 Appel API Groq...');
    
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile', // Modèle gratuit et puissant (le plus récent)
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 secondes timeout
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    console.log('✅ Réponse IA reçue');
    return aiResponse;

  } catch (error) {
    console.error('❌ Erreur API IA:', error.response?.data || error.message);
    
    // Messages d'erreur plus clairs
    if (error.response?.status === 401) {
      return "⚠️ Clé API invalide. Veuillez vérifier la configuration de l'IA.";
    } else if (error.response?.status === 429) {
      return "⏱️ Trop de requêtes. Veuillez patienter quelques instants avant de réessayer.";
    } else if (error.code === 'ECONNABORTED') {
      return "⏱️ La requête a pris trop de temps. Veuillez réessayer avec une question plus courte.";
    }
    
    return "❌ Erreur de connexion à l'IA. Veuillez réessayer dans quelques instants.";
  }
};

// @route   GET /api/chatbot/conversations
// @desc    Obtenir les conversations de l'utilisateur
// @access  Private
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ 
      userId: req.user._id, 
      isActive: true 
    }).sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/chatbot/conversations
// @desc    Créer une nouvelle conversation
// @access  Private
router.post('/conversations', auth, [
  body('title').trim().notEmpty().withMessage('Le titre est requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title } = req.body;

    const conversation = new Conversation({
      userId: req.user._id,
      title,
      messages: []
    });

    await conversation.save();

    res.status(201).json({
      message: 'Conversation créée avec succès',
      conversation
    });
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/chatbot/conversations/:id/messages/stream
// @desc    Envoyer un message et obtenir une réponse de l'IA en streaming (comme ChatGPT)
// @access  Private
router.post('/conversations/:id/messages/stream', auth, [
  body('content').trim().notEmpty().withMessage('Le contenu du message est requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;
    const conversationId = req.params.id;

    // Vérifier que la conversation appartient à l'utilisateur
    const conversation = await Conversation.findOne({ 
      _id: conversationId, 
      userId: req.user._id,
      isActive: true 
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Ajouter le message de l'utilisateur
    conversation.messages.push({
      role: 'user',
      content,
      timestamp: new Date()
    });

    // Configuration pour Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const apiKey = process.env.GROQ_API_KEY || config.GROQ_API_KEY;
    if (!apiKey) {
      res.write(`data: ${JSON.stringify({ error: '⚠️ L\'IA n\'est pas configurée.' })}\n\n`);
      res.end();
      return;
    }

    // Construire l'historique des messages
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    const recentHistory = conversation.messages.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      });
    });

    console.log('🤖 Appel API Groq en streaming...');

    try {
      // Appel à Groq avec streaming
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: 'llama-3.3-70b-versatile',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 0.9,
          stream: true // Active le streaming
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream',
          timeout: 60000
        }
      );

      let fullResponse = '';

      // Lire le stream
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.includes('[DONE]')) continue;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                fullResponse += content;
                // Envoyer chaque morceau au client
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
            } catch (e) {
              // Ignorer les erreurs de parsing
            }
          }
        }
      });

      response.data.on('end', async () => {
        console.log('✅ Streaming terminé');
        
        // Ajouter la réponse complète à la conversation
        conversation.messages.push({
          role: 'ai',
          content: fullResponse,
          timestamp: new Date()
        });
        
        conversation.updatedAt = new Date();
        await conversation.save();
        
        // Envoyer le signal de fin
        res.write(`data: ${JSON.stringify({ done: true, conversationId: conversation._id })}\n\n`);
        res.end();
      });

      response.data.on('error', (error) => {
        console.error('❌ Erreur streaming:', error);
        res.write(`data: ${JSON.stringify({ error: '❌ Erreur de streaming' })}\n\n`);
        res.end();
      });

    } catch (error) {
      console.error('❌ Erreur API IA:', error.response?.data || error.message);
      res.write(`data: ${JSON.stringify({ error: '❌ Erreur de connexion à l\'IA' })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/chatbot/conversations/:id/messages
// @desc    Envoyer un message et obtenir une réponse de l'IA (mode non-streaming, fallback)
// @access  Private
router.post('/conversations/:id/messages', auth, [
  body('content').trim().notEmpty().withMessage('Le contenu du message est requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body;
    const conversationId = req.params.id;

    // Vérifier que la conversation appartient à l'utilisateur
    const conversation = await Conversation.findOne({ 
      _id: conversationId, 
      userId: req.user._id,
      isActive: true 
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Ajouter le message de l'utilisateur
    conversation.messages.push({
      role: 'user',
      content,
      timestamp: new Date()
    });

    // Obtenir la réponse de l'IA avec le contexte de la conversation
    const aiResponse = await callAIAPI(content, conversation.messages);

    // Ajouter la réponse de l'IA
    conversation.messages.push({
      role: 'ai',
      content: aiResponse,
      timestamp: new Date()
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    res.json({
      message: 'Message envoyé avec succès',
      conversation
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   DELETE /api/chatbot/conversations/:id
// @desc    Supprimer une conversation
// @access  Private
router.delete('/conversations/:id', auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    conversation.isActive = false;
    await conversation.save();

    res.json({ message: 'Conversation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;

