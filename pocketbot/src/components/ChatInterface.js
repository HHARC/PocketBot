// src/components/ChatInterface.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Image
} from 'react-native';
import { processUserInput } from '../services/nlpService';
import { storeTransaction, getBalance, updateBalance, getTransactions } from '../services/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [balance, setBalance] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Load initial balance
    const loadBalance = async () => {
      const currentBalance = await getBalance();
      setBalance(currentBalance);
      // Add welcome message with a slight delay to simulate bot typing
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            id: Date.now().toString(),
            text: `Welcome to your finance tracker! Your current balance is $${currentBalance.toFixed(2)}. How can I help you today?`,
            sender: 'bot'
          }
        ]);
        setIsTyping(false);
      }, 1000);
    };
    
    loadBalance();
  }, []);

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user'
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    
    // Show bot typing indicator
    setIsTyping(true);
    
    // Process the user input
    const result = processUserInput(input);
    let botResponse = '';
    
    switch (result.type) {
      case 'BALANCE_QUERY':
        const currentBalance = await getBalance();
        botResponse = `Your current balance is $${currentBalance.toFixed(2)}.`;
        break;
        
      case 'EXPENSE':
        await storeTransaction(result.data);
        const newBalance = await updateBalance(result.data.amount);
        setBalance(newBalance);
        botResponse = `I've recorded your expense of $${Math.abs(result.data.amount).toFixed(2)} for ${result.data.category}. Your updated balance is $${newBalance.toFixed(2)}.`;
        break;
        
      case 'INCOME':
        await storeTransaction(result.data);
        const updatedBalance = await updateBalance(result.data.amount);
        setBalance(updatedBalance);
        botResponse = `I've recorded your income of $${result.data.amount.toFixed(2)}. Your updated balance is $${updatedBalance.toFixed(2)}.`;
        break;
        
      case 'SPENDING_REPORT':
        const transactions = await getTransactions();
        
        if (transactions.length === 0) {
          botResponse = "You don't have any recorded transactions yet.";
        } else {
          // Group by category
          const categories = {};
          transactions.forEach(transaction => {
            if (transaction.amount < 0) { // Only expenses
              if (!categories[transaction.category]) {
                categories[transaction.category] = 0;
              }
              categories[transaction.category] += Math.abs(transaction.amount);
            }
          });
          
          // Find top categories
          const sortedCategories = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
          
          if (sortedCategories.length > 0) {
            botResponse = "Here's a summary of your top spending categories:\n";
            sortedCategories.forEach(([category, amount], index) => {
              botResponse += `${index + 1}. ${category}: $${amount.toFixed(2)}\n`;
            });
            botResponse += "\nFor more detailed analysis, check the Reports screen.";
          } else {
            botResponse = "You don't have any recorded expenses yet.";
          }
        }
        break;
        
      default:
        botResponse = "I'm not sure I understand. You can tell me about expenses like 'I spent $25 on food' or ask about your balance.";
    }
    
    // Add bot response with a slight delay to feel more natural
    setTimeout(() => {
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot'
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.messageBubble, 
      item.sender === 'user' ? styles.userMessage : styles.botMessage
    ]}>
      {item.sender === 'bot' && (
        <View style={styles.botAvatarContainer}>
          <LinearGradient
            colors={['#4361EE', '#7209B7']}
            style={styles.botAvatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.botAvatarText}>🤖</Text>
          </LinearGradient>
        </View>
      )}
      <View style={[
        styles.messageContent,
        item.sender === 'user' ? styles.userMessageContent : styles.botMessageContent
      ]}>
        <Text style={[
          styles.messageText,
          item.sender === 'user' ? styles.userMessageText : styles.botMessageText
        ]}>{item.text}</Text>
      </View>
    </View>
  );

  // Quick suggestions
  const suggestions = [
    { id: '1', text: 'What\'s my balance?' },
    { id: '2', text: 'I spent $20 on food' },
    { id: '3', text: 'Show my spending' },
    { id: '4', text: 'I got paid $500' }
  ];

  const handleSuggestionPress = (suggestion) => {
    setInput(suggestion.text);
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity 
      style={styles.suggestionButton}
      onPress={() => handleSuggestionPress(item)}
    >
      <Text style={styles.suggestionText}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <BlurView intensity={20} tint="light" style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={[
          styles.balanceAmount,
          balance >= 0 ? styles.positiveBalance : styles.negativeBalance
        ]}>
          ${balance.toFixed(2)}
        </Text>
      </BlurView>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      {/* Suggestions */}
      {messages.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsList}
          />
        </View>
      )}
      
      {/* Bot typing indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <View style={styles.botAvatarContainer}>
            <LinearGradient
              colors={['#4361EE', '#7209B7']}
              style={styles.botAvatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.botAvatarText}>🤖</Text>
            </LinearGradient>
          </View>
          <View style={styles.typingBubble}>
            <View style={styles.typingDot} />
            <View style={[styles.typingDot, styles.typingDotMid]} />
            <View style={styles.typingDot} />
          </View>
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask me about your finances..."
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          onSubmitEditing={handleSend}
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
          disabled={input.trim() === ''}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  balanceContainer: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '800',
  },
  positiveBalance: {
    color: '#80FFDB',
  },
  negativeBalance: {
    color: '#FF6B8B',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  messageBubble: {
    flexDirection: 'row',
    marginVertical: 6,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  botAvatarContainer: {
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botAvatarText: {
    fontSize: 16,
  },
  messageContent: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  userMessageContent: {
    backgroundColor: 'rgba(67, 97, 238, 0.9)',
    borderBottomRightRadius: 4,
  },
  botMessageContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#FFFFFF',
  },
  suggestionsContainer: {
    marginBottom: 10,
  },
  suggestionsList: {
    paddingHorizontal: 8,
  },
  suggestionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  suggestionText: {
    color: '#fff',
    fontSize: 14,
  },
  typingContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginVertical: 6,
    marginHorizontal: 12,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 2,
    opacity: 0.3,
    animationName: 'typingAnimation',
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
  },
  typingDotMid: {
    opacity: 0.5,
    animationDelay: '0.5s',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    margin: 12,
    marginTop: 4,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    maxHeight: 120,
    paddingVertical: 6,
  },
  sendButton: {
    backgroundColor: 'rgba(67, 97, 238, 0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
});

export default ChatInterface;