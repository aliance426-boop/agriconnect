const express = require('express');
const { body, validationResult } = require('express-validator');
const Conversation = require('../models/Conversation');
const { auth } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Configuration pour l'API Gemini
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Fonction pour appeler l'API Gemini
const callGeminiAPI = async (message) => {
  try {
    const prompt = `Tu es un conseiller agricole virtuel spécialisé au Burkina Faso. 
    Réponds de manière concise et pratique aux questions agricoles. 
    Inclus des conseils spécifiques au climat et aux conditions du Burkina Faso.
    
    Question: ${message}
    
    Réponse:`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Erreur API Gemini:', error);
    return "Désolé, je ne peux pas répondre pour le moment. Veuillez réessayer plus tard.";
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

// @route   POST /api/chatbot/conversations/:id/messages
// @desc    Envoyer un message et obtenir une réponse de l'IA
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

    // Obtenir la réponse de l'IA
    const aiResponse = await callGeminiAPI(content);

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

