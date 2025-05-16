import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '@/constants/Api';
import { FontAwesome5 } from '@expo/vector-icons';

const ChatBotScreen = () => {
  const { plantId } = useLocalSearchParams();
  const [question, setQuestion] = useState('');
  const [chat, setChat] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = { sender: 'user', text: question };
    setChat(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch(`${api}/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plant_id: plantId, question }),
      });

      const data = await response.json();

      const botMessage = {
        sender: 'bot',
        text: data.success ? data.answer : `Error: ${data.error}`,
      };
      setChat(prev => [...prev, botMessage]);
    } catch (err) {
      setChat(prev => [...prev, { sender: 'bot', text: `Network error: ${err}` }]);
    } finally {
      setLoading(false);
    }
  };

  // ⬇ Auto-scroll to bottom on new message
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chat]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {chat.map((msg, idx) => (
          <View key={idx} style={[styles.messageRow, msg.sender === 'user' ? styles.userRow : styles.botRow]}>
            {msg.sender === 'bot' && (
              <View style={styles.avatar}>
                <FontAwesome5 name="leaf" size={18} color="#4CAF50" />
              </View>
            )}

            <View
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text style={styles.messageText} selectable>{msg.text}</Text>
            </View>

            {msg.sender === 'user' && (
              <View style={styles.avatar}>
                <FontAwesome5 name="user" size={18} color="#2196F3" />
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask something..."
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={askQuestion}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>{loading ? '...' : '➤'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatBotScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  chatContent: {
    paddingVertical: 20,
    paddingBottom: 100,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 6,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#cce5ff',
    marginRight: 6,
    borderTopRightRadius: 0,
  },
  botBubble: {
    backgroundColor: '#e2f0d9',
    marginLeft: 6,
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginHorizontal: 4,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
  },
});
