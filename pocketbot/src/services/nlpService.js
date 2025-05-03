// src/services/nlpService.js
import nlp from 'compromise';
import numbers from 'compromise-numbers';

nlp.extend(numbers);

export const processUserInput = (input) => {
  const doc = nlp(input);
  
  // Check for balance query
  if (input.includes('balance') || input.includes('how much') || input.includes('money left')) {
    return {
      type: 'BALANCE_QUERY',
      data: null
    };
  }
  
  // Check for spending report query
  if (input.includes('report') || input.includes('spending') || 
      (input.includes('what') && input.includes('spend'))) {
    return {
      type: 'SPENDING_REPORT',
      data: null
    };
  }
  
  // Extract expense information
  const money = doc.money().out('array');
  const amount = money.length > 0 
    ? parseFloat(money[0].replace(/[$,]/g, '')) 
    : null;
  
  if (amount && (input.includes('spent') || input.includes('bought') || input.includes('paid'))) {
    // Try to extract category
    let category = 'Other';
    
    // Common categories to detect
    const categories = [
      'food', 'grocery', 'restaurant', 'transport', 'uber', 'taxi', 
      'entertainment', 'movie', 'shopping', 'clothes', 'bill', 'utility', 
      'rent', 'subscription'
    ];
    
    for (const cat of categories) {
      if (input.toLowerCase().includes(cat)) {
        category = cat.charAt(0).toUpperCase() + cat.slice(1);
        break;
      }
    }
    
    return {
      type: 'EXPENSE',
      data: {
        amount: -amount, // Negative for expenses
        category,
        description: input,
        date: new Date().toISOString()
      }
    };
  }
  
  if (amount && (input.includes('received') || input.includes('earned') || input.includes('got'))) {
    return {
      type: 'INCOME',
      data: {
        amount: amount, // Positive for income
        category: 'Income',
        description: input,
        date: new Date().toISOString()
      }
    };
  }
  
  return {
    type: 'UNKNOWN',
    data: null
  };
};