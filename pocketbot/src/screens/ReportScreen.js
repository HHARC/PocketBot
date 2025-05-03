// src/screens/ReportScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getTransactions } from '../services/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const ReportScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadTransactions();
  }, [currentDate]);
  
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const allTransactions = await getTransactions();
      
      // Filter transactions for the current month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const filtered = allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getMonth() === month && 
               transactionDate.getFullYear() === year;
      });
      
      setTransactions(filtered);
      
      // Calculate totals
      let income = 0;
      let expense = 0;
      
      filtered.forEach(transaction => {
        if (transaction.amount > 0) {
          income += transaction.amount;
        } else {
          expense += Math.abs(transaction.amount);
        }
      });
      
      setMonthlyIncome(income);
      setMonthlyExpense(expense);
      setMonthlyTotal(income - expense);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };
  
  const formatDate = (date) => {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  const formatTransactionDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  const getCategoryIcon = (category) => {
    const categoryMap = {
      'Food': 'restaurant-outline',
      'Groceries': 'basket-outline',
      'Transportation': 'car-outline',
      'Entertainment': 'film-outline',
      'Shopping': 'cart-outline',
      'Housing': 'home-outline',
      'Utilities': 'flash-outline',
      'Health': 'medical-outline',
      'Travel': 'airplane-outline',
      'Education': 'school-outline',
      'Salary': 'cash-outline',
      'Investment': 'trending-up-outline',
      'Gift': 'gift-outline',
    };
    
    return categoryMap[category] || 'pricetag-outline';
  };
  
  if (loading) {
    return (
      <LinearGradient
        colors={['#6A11CB', '#2575FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading your report...</Text>
      </LinearGradient>
    );
  }
  
  return (
    <LinearGradient
      colors={['#6A11CB', '#2575FC']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📊 Monthly Report</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.monthSelector}>
          <TouchableOpacity 
            style={styles.monthNavButton} 
            onPress={() => changeMonth(-1)}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <BlurView intensity={25} tint="light" style={styles.monthTitleContainer}>
            <Text style={styles.monthTitle}>{formatDate(currentDate)}</Text>
          </BlurView>
          <TouchableOpacity 
            style={styles.monthNavButton} 
            onPress={() => changeMonth(1)}
          >
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.summaryContainer}>
          <BlurView intensity={20} tint="light" style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Balance</Text>
            <Text style={[
              styles.balanceValue, 
              monthlyTotal >= 0 ? styles.positiveBalance : styles.negativeBalance
            ]}>
              ${Math.abs(monthlyTotal).toFixed(2)}
            </Text>
            <Text style={styles.balanceStatus}>
              {monthlyTotal >= 0 ? 'You saved money this month!' : 'You spent more than you earned'}
            </Text>
          </BlurView>
          
          <View style={styles.summaryRow}>
            <BlurView intensity={25} tint="light" style={[styles.summaryCard, styles.incomeCard]}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="arrow-down-circle" size={22} color="#56CFE1" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Income</Text>
                <Text style={styles.incomeValue}>${monthlyIncome.toFixed(2)}</Text>
              </View>
            </BlurView>
            
            <BlurView intensity={25} tint="light" style={[styles.summaryCard, styles.expenseCard]}>
              <View style={styles.summaryIconContainer}>
                <Ionicons name="arrow-up-circle" size={22} color="#FF6B8B" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Expenses</Text>
                <Text style={styles.expenseValue}>${monthlyExpense.toFixed(2)}</Text>
              </View>
            </BlurView>
          </View>
        </View>
        
        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Transactions</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>Filter</Text>
              <Ionicons name="filter-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.transactionsList}
            showsVerticalScrollIndicator={false}
          >
            {transactions.length > 0 ? (
              transactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((transaction, index) => (
                  <BlurView key={index} intensity={20} tint="light" style={styles.transactionItem}>
                    <View style={styles.transactionIcon}>
                      <Ionicons name={getCategoryIcon(transaction.category)} size={22} color="#fff" />
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionCategory}>{transaction.category}</Text>
                      <Text style={styles.transactionDate}>{formatTransactionDate(transaction.date)}</Text>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      transaction.amount >= 0 ? styles.incomeAmount : styles.expenseAmount
                    ]}>
                      {transaction.amount >= 0 ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </Text>
                  </BlurView>
                ))
            ) : (
              <BlurView intensity={20} tint="light" style={styles.noDataContainer}>
                <Ionicons name="calendar-outline" size={40} color="#ffffff" />
                <Text style={styles.noDataText}>No transactions for {formatDate(currentDate)}</Text>
                <TouchableOpacity style={styles.addButton}>
                  <Text style={styles.addButtonText}>Add Transaction</Text>
                </TouchableOpacity>
              </BlurView>
            )}
            
            {/* Bottom Spacing */}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  monthNavButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  monthTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  balanceCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'center',
    overflow: 'hidden',
  },
  balanceTitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 5,
  },
  positiveBalance: {
    color: '#80FFDB',
  },
  negativeBalance: {
    color: '#FF6B8B',
  },
  balanceStatus: {
    color: '#fff',
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    overflow: 'hidden',
    width: '48%',
  },
  incomeCard: {
    marginRight: 10,
  },
  expenseCard: {
    marginLeft: 10,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginBottom: 2,
  },
  incomeValue: {
    color: '#80FFDB',
    fontSize: 18,
    fontWeight: '700',
  },
  expenseValue: {
    color: '#FF6B8B',
    fontSize: 18,
    fontWeight: '700',
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  transactionsTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  filterText: {
    color: '#fff',
    marginRight: 5,
    fontSize: 14,
  },
  transactionsList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  incomeAmount: {
    color: '#80FFDB',
  },
  expenseAmount: {
    color: '#FF6B8B',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 20,
    height: 250,
    overflow: 'hidden',
  },
  noDataText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ReportScreen;