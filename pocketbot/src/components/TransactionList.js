// src/components/TransactionList.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { getTransactions } from '../services/storage';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const TransactionList = ({ refreshTrigger, onTransactionSelect }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'expense', 'income'
  
  useEffect(() => {
    loadTransactions();
  }, [refreshTrigger]);
  
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const allTransactions = await getTransactions();
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Failed to load transactions', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getCategoryIcon = (category) => {
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
    
    return categoryMap[category] || 'pricetag-outline';
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    
    // Check if the date is today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if the date is yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Return formatted date
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  const getFilteredTransactions = () => {
    switch (filterType) {
      case 'expense':
        return transactions.filter(t => t.amount < 0);
      case 'income':
        return transactions.filter(t => t.amount > 0);
      default:
        return transactions;
    }
  };
  
  const groupTransactionsByDate = () => {
    const filtered = getFilteredTransactions();
    const grouped = {};
    
    filtered.forEach(transaction => {
      const date = new Date(transaction.date);
      const dateString = date.toDateString();
      
      if (!grouped[dateString]) {
        grouped[dateString] = {
          title: formatDate(transaction.date),
          data: []
        };
      }
      
      grouped[dateString].data.push(transaction);
    });
    
    // Convert to array and sort by date (newest first)
    return Object.values(grouped).sort((a, b) => {
      const dateA = new Date(a.data[0].date);
      const dateB = new Date(b.data[0].date);
      return dateB - dateA;
    });
  };
  
  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={() => onTransactionSelect && onTransactionSelect(item)}
    >
      <View style={[
        styles.iconContainer,
        item.amount < 0 ? styles.expenseIconBg : styles.incomeIconBg
      ]}>
        <Ionicons 
          name={getCategoryIcon(item.category)} 
          size={20} 
          color="#fff" 
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.categoryText}>{item.category}</Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={[
          styles.amount,
          item.amount < 0 ? styles.expense : styles.income
        ]}>
          {item.amount < 0 ? '-' : '+'}${Math.abs(item.amount).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  const renderDateSection = ({ item }) => (
    <View style={styles.dateSection}>
      <Text style={styles.dateSectionTitle}>{item.title}</Text>
      {item.data.map((transaction, index) => (
        <BlurView 
          key={transaction.date + index} 
          intensity={15} 
          tint="light" 
          style={styles.transactionItemContainer}
        >
          {renderTransactionItem({ item: transaction })}
        </BlurView>
      ))}
    </View>
  );
  
  const groupedTransactions = groupTransactionsByDate();
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filterType === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[
              styles.filterText,
              filterType === 'all' && styles.filterTextActive
            ]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filterType === 'expense' && styles.filterButtonActive
            ]}
            onPress={() => setFilterType('expense')}
          >
            <Text style={[
              styles.filterText,
              filterType === 'expense' && styles.filterTextActive
            ]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton,
              filterType === 'income' && styles.filterButtonActive
            ]}
            onPress={() => setFilterType('income')}
          >
            <Text style={[
              styles.filterText,
              filterType === 'income' && styles.filterTextActive
            ]}>Income</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {groupedTransactions.length > 0 ? (
        <FlatList
          data={groupedTransactions}
          renderItem={renderDateSection}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <BlurView intensity={20} tint="light" style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={50} color="rgba(255, 255, 255, 0.7)" />
          <Text style={styles.emptyText}>No transactions found</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </BlurView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 50,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dateSection: {
    marginBottom: 20,
  },
  dateSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    marginLeft: 4,
  },
  transactionItemContainer: {
    borderRadius: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseIconBg: {
    backgroundColor: 'rgba(255, 107, 139, 0.8)',
  },
  incomeIconBg: {
    backgroundColor: 'rgba(67, 97, 238, 0.8)',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  expense: {
    color: '#FF6B8B',
  },
  income: {
    color: '#80FFDB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    margin: 20,
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 15,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: 'rgba(67, 97, 238, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default TransactionList;