// src/components/TransactionForm.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { storeTransaction, updateBalance } from '../services/storage';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const TransactionForm = ({ onTransactionAdded }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [transactionType, setTransactionType] = useState('expense');
  
  const categories = [
    'Food', 'Transport', 'Shopping', 'Entertainment', 
    'Bills', 'Health', 'Education', 'Travel', 'Groceries', 'Other'
  ];
  
  const getCategoryIcon = (categoryName) => {
    const categoryMap = {
      'Food': 'restaurant-outline',
      'Transport': 'car-outline',
      'Shopping': 'cart-outline',
      'Entertainment': 'film-outline',
      'Bills': 'document-text-outline',
      'Health': 'medical-outline',
      'Education': 'school-outline',
      'Travel': 'airplane-outline',
      'Groceries': 'basket-outline',
      'Other': 'pricetag-outline'
    };
    
    return categoryMap[categoryName] || 'pricetag-outline';
  };
  
  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (!description) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    
    const numericAmount = parseFloat(amount);
    const finalAmount = transactionType === 'expense' ? -numericAmount : numericAmount;
    
    const transaction = {
      amount: finalAmount,
      description,
      category,
      date: new Date().toISOString()
    };
    
    try {
      await storeTransaction(transaction);
      const newBalance = await updateBalance(finalAmount);
      
      setAmount('');
      setDescription('');
      setCategory('Food');
      
      if (onTransactionAdded) {
        onTransactionAdded(newBalance);
      }
      
      Alert.alert('Success', 'Transaction added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
      console.error(error);
    }
  };
  
  const renderCategoryItem = (cat) => {
    return (
      <TouchableOpacity 
        key={cat} 
        style={[
          styles.categoryItem,
          category === cat && styles.categoryItemSelected
        ]}
        onPress={() => setCategory(cat)}
      >
        <View style={[
          styles.categoryIcon,
          category === cat && styles.categoryIconSelected
        ]}>
          <Ionicons
            name={getCategoryIcon(cat)}
            size={22}
            color={category === cat ? '#fff' : 'rgba(255, 255, 255, 0.7)'} 
          />
        </View>
        <Text style={[
          styles.categoryText,
          category === cat && styles.categoryTextSelected
        ]}>
          {cat}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <BlurView intensity={25} tint="light" style={styles.container}>
      <Text style={styles.formTitle}>Add New Transaction</Text>
      
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            transactionType === 'expense' ? styles.expenseTypeActive : styles.typeInactive
          ]}
          onPress={() => setTransactionType('expense')}
        >
          <Ionicons
            name="arrow-up-circle"
            size={18}
            color={transactionType === 'expense' ? '#fff' : 'rgba(255, 255, 255, 0.6)'} 
            style={styles.typeIcon}
          />
          <Text style={[
            styles.typeText,
            transactionType === 'expense' ? styles.activeTypeText : styles.inactiveTypeText
          ]}>Expense</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.typeButton,
            transactionType === 'income' ? styles.incomeTypeActive : styles.typeInactive
          ]}
          onPress={() => setTransactionType('income')}
        >
          <Ionicons
            name="arrow-down-circle"
            size={18}
            color={transactionType === 'income' ? '#fff' : 'rgba(255, 255, 255, 0.6)'} 
            style={styles.typeIcon}
          />
          <Text style={[
            styles.typeText,
            transactionType === 'income' ? styles.activeTypeText : styles.inactiveTypeText
          ]}>Income</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputRow}>
        <Text style={styles.label}>Amount</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <View style={styles.inputRow}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="What is this transaction for?"
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
        />
      </View>
      
      <View style={styles.inputRow}>
        <Text style={styles.label}>Category</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(cat => renderCategoryItem(cat))}
        </ScrollView>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.addButton,
          transactionType === 'expense' ? styles.expenseButton : styles.incomeButton
        ]} 
        onPress={handleSubmit}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" style={styles.addButtonIcon} />
        <Text style={styles.addButtonText}>Add {transactionType === 'expense' ? 'Expense' : 'Income'}</Text>
      </TouchableOpacity>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    margin: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  typeInactive: {
    backgroundColor: 'transparent',
  },
  expenseTypeActive: {
    backgroundColor: '#FF6B8B',
  },
  incomeTypeActive: {
    backgroundColor: '#80FFDB',
  },
  typeIcon: {
    marginRight: 6,
  },
  typeText: {
    fontWeight: '600',
  },
  activeTypeText: {
    color: '#fff',
  },
  inactiveTypeText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  inputRow: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#fff',
    fontSize: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  categoriesContainer: {
    maxHeight: 100,
  },
  categoriesContent: {
    paddingVertical: 4,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryIconSelected: {
    backgroundColor: 'rgba(67, 97, 238, 0.9)',
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryItemSelected: {
    // No additional styling needed for the container
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 50,
    marginTop: 10,
  },
  expenseButton: {
    backgroundColor: '#FF6B8B',
  },
  incomeButton: {
    backgroundColor: '#4361EE',
  },
  addButtonIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});


export default TransactionForm;