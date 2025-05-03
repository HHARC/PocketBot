// src/services/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeTransaction = async (transaction) => {
  try {
    const existingTransactions = await getTransactions();
    const updatedTransactions = [...existingTransactions, transaction];
    await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    return true;
  } catch (e) {
    console.error('Error saving transaction:', e);
    return false;
  }
};

export const getTransactions = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('transactions');
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error getting transactions:', e);
    return [];
  }
};

export const updateBalance = async (amount) => {
  try {
    const currentBalance = await getBalance();
    const newBalance = currentBalance + amount;
    await AsyncStorage.setItem('balance', newBalance.toString());
    return newBalance;
  } catch (e) {
    console.error('Error updating balance:', e);
    return null;
  }
};

export const getBalance = async () => {
  try {
    const value = await AsyncStorage.getItem('balance');
    return value != null ? parseFloat(value) : 0;
  } catch (e) {
    console.error('Error getting balance:', e);
    return 0;
  }
};