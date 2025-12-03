# 🤖 Configuration de l'IA Groq pour AgriConnect

## Pourquoi Groq ?

- ✅ **100% Gratuit** - Pas de carte bancaire requise
- ✅ **Ultra rapide** - Réponses en 1-2 secondes
- ✅ **Puissant** - Modèle Llama 3.1 70B (comparable à ChatGPT)
- ✅ **Généreux** - 30 requêtes/minute gratuitement
- ✅ **Facile** - Configuration en 2 minutes

## Étape 1 : Obtenir une clé API Groq (gratuite)

1. **Créer un compte**
   - Allez sur https://console.groq.com
   - Cliquez sur "Sign Up" ou "Get Started"
   - Inscrivez-vous avec votre email (ou Google/GitHub)

2. **Générer une clé API**
   - Une fois connecté, allez dans la section "API Keys"
   - Cliquez sur "Create API Key"
   - Donnez un nom à votre clé (ex: "AgriConnect")
   - Cliquez sur "Submit"
   - **COPIEZ LA CLÉ** (elle commence par `gsk_...`)
   - ⚠️ Vous ne pourrez plus la revoir, copiez-la maintenant !

## Étape 2 : Configurer la clé dans Render

1. **Accéder à votre service Render**
   - Allez sur https://dashboard.render.com
   - Sélectionnez votre service `agriconnect-backend`

2. **Ajouter la variable d'environnement**
   - Cliquez sur "Environment" dans le menu de gauche
   - Cliquez sur "Add Environment Variable"
   - **Key** : `GROQ_API_KEY`
   - **Value** : Collez votre clé API (celle qui commence par `gsk_...`)
   - Cliquez sur "Save Changes"

3. **Redémarrer le service**
   - Le service devrait redémarrer automatiquement
   - Sinon, cliquez sur "Manual Deploy" → "Deploy latest commit"

## Étape 3 : Tester

1. Attendez que le déploiement soit terminé (1-2 minutes)
2. Allez sur votre application frontend
3. Créez une conversation dans le chatbot
4. Posez une question : "Quand planter les tomates au Burkina Faso ?"
5. Vous devriez recevoir une réponse détaillée en 1-2 secondes !

## Configuration locale (développement)

Si vous développez en local, créez un fichier `.env` dans `backend/` :

```env
GROQ_API_KEY=gsk_votre_cle_ici
```

## Exemples de questions à tester

- "Quand planter les tomates au Burkina Faso ?"
- "Comment traiter les maladies du riz ?"
- "Quel engrais utiliser pour le maïs ?"
- "Techniques d'irrigation efficaces pour le sahel"
- "Comment lutter contre les criquets ?"

## Limites gratuites Groq

- **30 requêtes par minute**
- **14,400 requêtes par jour**
- **6,000 tokens par requête**

C'est largement suffisant pour votre application !

## En cas de problème

### Erreur "Clé API invalide"
- Vérifiez que vous avez bien copié toute la clé (commence par `gsk_`)
- Assurez-vous qu'il n'y a pas d'espaces avant ou après la clé
- Régénérez une nouvelle clé si nécessaire

### Erreur "Trop de requêtes"
- Attendez 1 minute (limite de 30 requêtes/minute)
- Utilisez moins le chatbot en développement

### Pas de réponse
- Vérifiez les logs dans Render
- Assurez-vous que le service a bien redémarré après l'ajout de la clé

## Support

- Documentation Groq : https://console.groq.com/docs
- Limites et quotas : https://console.groq.com/settings/limits

---

**Félicitations !** 🎉 Votre IA agricole est maintenant opérationnelle !



