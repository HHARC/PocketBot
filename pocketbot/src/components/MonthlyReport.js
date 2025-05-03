// src/components/MonthlyReport.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { getTransactions } from '../services/storage';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const MonthlyReport = ({ month, year }) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [dailyData, setDailyData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [categoryData, setCategoryData] = useState([]);
  const [selectedChart, setSelectedChart] = useState('daily'); // 'daily' or 'category'
  
  const screenWidth = Dimensions.get('window').width - 40; // Accounting for padding
  
  // Use current month and year if not provided
  const currentDate = new Date();
  const reportMonth = month !== undefined ? month : currentDate.getMonth();
  const reportYear = year !== undefined ? year : currentDate.getFullYear();
  
  useEffect(() => {
    loadMonthlyData();
  }, [reportMonth, reportYear]);
  
  const loadMonthlyData = async () => {
    setLoading(true);
    try {
      const allTransactions = await getTransactions();
      
      // Filter for the specific month and year
      const filtered = allTransactions.filter(transaction => {
        const date = new Date(transaction.date);
        return date.getMonth() === reportMonth && date.getFullYear() === reportYear;
      });
      
      setTransactions(filtered);
      processTransactions(filtered);
    } catch (error) {
      console.error('Failed to load transactions for monthly report', error);
    } finally {
      setLoading(false);
    }
  };
  
  const processTransactions = (monthTransactions) => {
    // Calculate monthly totals
    let income = 0;
    let expense = 0;
    
    monthTransactions.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      } else {
        expense += Math.abs(transaction.amount);
      }
    });
    
    setMonthlyIncome(income);
    setMonthlyExpense(expense);
    setMonthlyTotal(income - expense);
    
    // Process daily spending data for chart
    processDailyData(monthTransactions);
    
    // Process category data
    processCategoryData(monthTransactions);
  };
  
  const processDailyData = (monthTransactions) => {
    // Create a map of dates in the month to ensure all days are represented
    const daysInMonth = new Date(reportYear, reportMonth + 1, 0).getDate();
    const dailyMap = {};
    
    // Initialize all days with zero
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${i}`;
      dailyMap[dateStr] = 0;
    }
    
    // Populate with actual expense data
    monthTransactions.forEach(transaction => {
      if (transaction.amount < 0) { // Only expenses
        const date = new Date(transaction.date);
        const day = date.getDate();
        const dateStr = `${day}`;
        
        if (dailyMap[dateStr] !== undefined) {
          dailyMap[dateStr] += Math.abs(transaction.amount);
        }
      }
    });
    
    // Prepare data for the chart
    // Show only every 5th day on the x-axis to avoid crowding
    const days = Object.keys(dailyMap).sort((a, b) => parseInt(a) - parseInt(b));
    const labels = days.filter(day => parseInt(day) % 5 === 0 || parseInt(day) === 1 || parseInt(day) === daysInMonth);
    
    // Always include data for all days
    const data = days.map(day => dailyMap[day]);
    
    setDailyData({
      labels,
      datasets: [{ 
        data,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2
      }]
    });
  };
  
  const processCategoryData = (monthTransactions) => {
    const categories = {};
    
    // Process only expenses
    monthTransactions.forEach(transaction => {
      if (transaction.amount < 0) {
        const { category, amount } = transaction;
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += Math.abs(amount);
      }
    });
    
    // Sort categories by amount and take top 5
    const sortedCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // Prepare data for the chart
    const categoryLabels = sortedCategories.map(([category]) => category);
    const categoryAmounts = sortedCategories.map(([, amount]) => amount);
    
    setCategoryData({
      labels: categoryLabels,
      datasets: [{ 
        data: categoryAmounts,
        colors: [
          (opacity = 1) => `rgba(255, 107, 139, ${opacity})`,
          (opacity = 1) => `rgba(67, 97, 238, ${opacity})`,
          (opacity = 1) => `rgba(114, 9, 183, ${opacity})`,
          (opacity = 1) => `rgba(72, 191, 227, ${opacity})`,
          (opacity = 1) => `rgba(86, 207, 225, ${opacity})`,
        ]
      }]
    });
  };
  
  const getMonthName = (monthIndex) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[monthIndex];
  };
  
  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'rgba(255, 255, 255, 0.1)',
    backgroundGradientTo: 'rgba(255, 255, 255, 0.2)',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#4361EE'
    },
    barPercentage: 0.7
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Generating your monthly report...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthTitle}>{getMonthName(reportMonth)} {reportYear}</Text>
        <BlurView intensity={20} tint="light" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.incomeText}>${monthlyIncome.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={styles.expenseText}>${monthlyExpense.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Monthly Balance</Text>
            <Text style={[
              styles.balanceAmount,
              monthlyTotal >= 0 ? styles.positiveBalance : styles.negativeBalance
            ]}>
              ${Math.abs(monthlyTotal).toFixed(2)}
            </Text>
            <Text style={styles.balanceStatus}>
              {monthlyTotal >= 0 ? 'Savings' : 'Overspent'}
            </Text>
          </View>
        </BlurView>
      </View>
      
      <View style={styles.chartContainer}>
        <View style={styles.chartTabsContainer}>
          <TouchableOpacity 
            style={[
              styles.chartTab, 
              selectedChart === 'daily' && styles.activeChartTab
            ]}
            onPress={() => setSelectedChart('daily')}
          >
            <Ionicons 
              name="analytics-outline" 
              size={18} 
              color={selectedChart === 'daily' ? '#fff' : 'rgba(255, 255, 255, 0.6)'} 
              style={styles.chartTabIcon}
            />
            <Text style={[
              styles.chartTabText,
              selectedChart === 'daily' && styles.activeChartTabText
            ]}>Daily Spending</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.chartTab, 
              selectedChart === 'category' && styles.activeChartTab
            ]}
            onPress={() => setSelectedChart('category')}
          >
            <Ionicons 
              name="pie-chart-outline" 
              size={18} 
              color={selectedChart === 'category' ? '#fff' : 'rgba(255, 255, 255, 0.6)'} 
              style={styles.chartTabIcon}
            />
            <Text style={[
              styles.chartTabText,
              selectedChart === 'category' && styles.activeChartTabText
            ]}>By Category</Text>
          </TouchableOpacity>
        </View>
        
        <BlurView intensity={20} tint="light" style={styles.chartCard}>
          {selectedChart === 'daily' ? (
            <>
              <Text style={styles.chartTitle}>Daily Expenses</Text>
              {dailyData.datasets[0].data.some(value => value > 0) ? (
                <LineChart
                  data={dailyData}
                  width={screenWidth - 20}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Ionicons name="analytics-outline" size={40} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.noDataText}>No expense data for this month</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.chartTitle}>Top Spending Categories</Text>
              {categoryData.datasets && categoryData.datasets[0].data.length > 0 ? (
                <BarChart
                  data={categoryData}
                  width={screenWidth - 20}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  yAxisLabel="$"
                  verticalLabelRotation={30}
                  fromZero
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Ionicons name="pie-chart-outline" size={40} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.noDataText}>No category data for this month</Text>
                </View>
              )}
            </>
          )}
        </BlurView>
      </View>
      
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Monthly Insights</Text>
        
        {transactions.length > 0 ? (
          <>
            <BlurView intensity={20} tint="light" style={styles.insightCard}>
              <View style={styles.insightIconContainer}>
                <Ionicons name="calendar-outline" size={24} color="#FF6B8B" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Spending Days</Text>
                <Text style={styles.insightValue}>
                  {new Set(transactions.filter(t => t.amount < 0).map(t => new Date(t.date).getDate())).size} days
                </Text>
              </View>
            </BlurView>
            
            <BlurView intensity={20} tint="light" style={styles.insightCard}>
              <View style={styles.insightIconContainer}>
                <Ionicons name="trending-up-outline" size={24} color="#4361EE" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Highest Expense</Text>
                <Text style={styles.insightValue}>
                  ${Math.max(...transactions.filter(t => t.amount < 0).map(t => Math.abs(t.amount))).toFixed(2)}
                </Text>
              </View>
            </BlurView>
            
            <BlurView intensity={20} tint="light" style={styles.insightCard}>
              <View style={styles.insightIconContainer}>
                <Ionicons name="cash-outline" size={24} color="#80FFDB" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Average Daily Spend</Text>
                <Text style={styles.insightValue}>
                  ${(monthlyExpense / Math.max(1, new Set(transactions.filter(t => t.amount < 0).map(t => new Date(t.date).getDate())).size)).toFixed(2)}
                </Text>
              </View>
            </BlurView>
          </>
        ) : (
          <BlurView intensity={20} tint="light" style={styles.noInsightsContainer}>
            <Ionicons name="document-text-outline" size={40} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.noDataText}>No transactions for this month</Text>
          </BlurView>
        )}
      </View>
      
      {/* Bottom spacing */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
  },
  header: {
    padding: 20,
  },
  monthTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 15,
  },
  summaryCard: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 4,
  },
  incomeText: {
    color: '#80FFDB',
    fontSize: 20,
    fontWeight: '700',
  },
  expenseText: {
    color: '#FF6B8B',
    fontSize: 20,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 15,
  },
  balanceContainer: {
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 2,
  },
  positiveBalance: {
    color: '#80FFDB',
  },
  negativeBalance: {
    color: '#FF6B8B',
  },
  balanceStatus: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  chartContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chartTabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
    padding: 4,
    marginBottom: 15,
  },
  chartTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 50,
  },
  activeChartTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  chartTabIcon: {
    marginRight: 6,
  },
  chartTabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  activeChartTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  chartCard: {
    borderRadius: 20,
    padding: 15,
    overflow: 'hidden',
  },
  chartTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
    paddingRight: 20,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    height: 180,
  },
  noDataText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  insightsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    overflow: 'hidden',
  },
  insightIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 4,
  },
  insightValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  noInsightsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 16,
    overflow: 'hidden',
  },
});

export default MonthlyReport;