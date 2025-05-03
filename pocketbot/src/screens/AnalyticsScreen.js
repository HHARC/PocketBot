// src/screens/AnalyticsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { getTransactions } from '../services/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const AnalyticsScreen = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    datasets: [{ data: [] }]
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monthly'); // 'monthly' or 'category'
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const transactions = await getTransactions();
        processTransactions(transactions);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const processTransactions = (transactions) => {
    // Process category data for pie chart
    const categories = {};
    
    // Process only expenses (negative amounts)
    transactions.forEach(transaction => {
      if (transaction.amount < 0) {
        const { category, amount } = transaction;
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += Math.abs(amount);
      }
    });
    
    // Prepare data for pie chart with vibrant colors
    const pieData = Object.entries(categories).map(([category, amount], index) => {
      const colors = [
        '#FF6B8B', '#4361EE', '#7209B7', '#48BFE3', '#56CFE1', 
        '#64DFDF', '#80FFDB', '#B5179E', '#F72585', '#7400B8'
      ];
      
      return {
        name: category,
        amount,
        color: colors[index % colors.length],
        legendFontColor: '#FFF',
        legendFontSize: 13
      };
    });
    
    setCategoryData(pieData);
    
    // Process monthly data for line chart
    const monthlyExpenses = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    transactions.forEach(transaction => {
      if (transaction.amount < 0) { // Only expenses
        const date = new Date(transaction.date);
        const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        
        if (!monthlyExpenses[monthYear]) {
          monthlyExpenses[monthYear] = 0;
        }
        
        monthlyExpenses[monthYear] += Math.abs(transaction.amount);
      }
    });
    
    // Sort by date
    const sortedMonths = Object.keys(monthlyExpenses).sort((a, b) => {
      const [aMonth, aYear] = a.split(' ');
      const [bMonth, bYear] = b.split(' ');
      
      if (aYear !== bYear) return aYear - bYear;
      return monthNames.indexOf(aMonth) - monthNames.indexOf(bMonth);
    });
    
    // Prepare data for line chart
    const lineData = {
      labels: sortedMonths,
      datasets: [{
        data: sortedMonths.map(month => monthlyExpenses[month]),
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 3
      }]
    };
    
    setMonthlyData(lineData);
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
      r: '6',
      strokeWidth: '2',
      stroke: '#4361EE'
    },
    propsForBackgroundLines: {
      strokeDasharray: '6, 6',
      stroke: 'rgba(255, 255, 255, 0.4)'
    }
  };
  
  const screenWidth = Dimensions.get('window').width;
  
  if (loading) {
    return (
      <LinearGradient
        colors={['#6A11CB', '#2575FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading your analytics...</Text>
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
          <Text style={styles.headerTitle}>💰 Financial Analytics</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Summary Cards */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.summaryScroll}
          contentContainerStyle={styles.summaryContainer}
        >
          <BlurView intensity={25} tint="light" style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="trending-down-outline" size={24} color="#FF6B8B" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Total Spent</Text>
              <Text style={styles.summaryValue}>
                ${categoryData.reduce((sum, cat) => sum + cat.amount, 0).toFixed(2)}
              </Text>
            </View>
          </BlurView>
          
          <BlurView intensity={25} tint="light" style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="pricetag-outline" size={24} color="#4361EE" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Categories</Text>
              <Text style={styles.summaryValue}>{categoryData.length}</Text>
            </View>
          </BlurView>
          
          <BlurView intensity={25} tint="light" style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="bar-chart-outline" size={24} color="#A5B4FC" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Months Tracked</Text>
              <Text style={styles.summaryValue}>{monthlyData.labels.length}</Text>
            </View>
          </BlurView>
        </ScrollView>
        
        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'monthly' && styles.activeTabButton]}
            onPress={() => setActiveTab('monthly')}
          >
            <Text style={[styles.tabText, activeTab === 'monthly' && styles.activeTabText]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'category' && styles.activeTabButton]}
            onPress={() => setActiveTab('category')}
          >
            <Text style={[styles.tabText, activeTab === 'category' && styles.activeTabText]}>Categories</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Monthly Chart View */}
          {activeTab === 'monthly' && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Monthly Spending</Text>
              {monthlyData.labels.length > 0 ? (
                <View style={styles.chartWrapper}>
                  <LineChart
                    data={monthlyData}
                    width={screenWidth - 60}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    verticalLabelRotation={30}
                  />
                </View>
              ) : (
                <BlurView intensity={20} tint="light" style={styles.noDataContainer}>
                  <Ionicons name="analytics-outline" size={40} color="#ffffff" />
                  <Text style={styles.noDataText}>No monthly data available</Text>
                </BlurView>
              )}
            </View>
          )}
          
          {/* Category Chart View */}
          {activeTab === 'category' && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Spending by Category</Text>
              {categoryData.length > 0 ? (
                <View style={styles.pieContainer}>
                  <PieChart
                    data={categoryData}
                    width={screenWidth - 60}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="amount"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                  />
                </View>
              ) : (
                <BlurView intensity={20} tint="light" style={styles.noDataContainer}>
                  <Ionicons name="pie-chart-outline" size={40} color="#ffffff" />
                  <Text style={styles.noDataText}>No category data available</Text>
                </BlurView>
              )}
            </View>
          )}
          
          {/* Top Spending Categories */}
          <View style={styles.topCategoriesContainer}>
            <Text style={styles.chartTitle}>Top Spending Categories</Text>
            {categoryData.length > 0 ? (
              <BlurView intensity={20} tint="light" style={styles.categoriesListContainer}>
                {categoryData
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map((category, index) => (
                    <View key={index} style={styles.categoryItem}>
                      <View style={styles.categoryInfo}>
                        <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                        <Text style={styles.categoryName}>{category.name}</Text>
                      </View>
                      <Text style={styles.categoryAmount}>${category.amount.toFixed(2)}</Text>
                    </View>
                  ))}
              </BlurView>
            ) : (
              <BlurView intensity={20} tint="light" style={styles.noDataContainer}>
                <Ionicons name="list-outline" size={40} color="#ffffff" />
                <Text style={styles.noDataText}>No category data available</Text>
              </BlurView>
            )}
          </View>
          
          {/* Spending Insights - Optional Section */}
          {categoryData.length > 0 && (
            <View style={styles.insightsContainer}>
              <Text style={styles.chartTitle}>Spending Insights</Text>
              <BlurView intensity={20} tint="light" style={styles.insightCard}>
                <Ionicons name="trending-up-outline" size={24} color="#FF6B8B" />
                <Text style={styles.insightText}>
                  Highest spending category is <Text style={styles.insightHighlight}>
                    {categoryData.sort((a, b) => b.amount - a.amount)[0]?.name}
                  </Text>
                </Text>
              </BlurView>
              
              {monthlyData.labels.length > 1 && (
                <BlurView intensity={20} tint="light" style={styles.insightCard}>
                  <Ionicons name="calendar-outline" size={24} color="#4361EE" />
                  <Text style={styles.insightText}>
                    Spending {monthlyData.datasets[0].data[monthlyData.datasets[0].data.length - 1] > 
                    monthlyData.datasets[0].data[monthlyData.datasets[0].data.length - 2] ? 
                    'increased' : 'decreased'} in the last month
                  </Text>
                </BlurView>
              )}
            </View>
          )}
          
          {/* Bottom Spacing */}
          <View style={{ height: 20 }} />
        </ScrollView>
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryScroll: {
    maxHeight: 100,
    marginBottom: 20,
  },
  summaryContainer: {
    paddingHorizontal: 15,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 5,
    width: 170,
    overflow: 'hidden',
  },
  summaryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginBottom: 2,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 50,
  },
  activeTabButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    fontSize: 15,
  },
  activeTabText: {
    color: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  chartTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    marginLeft: 5,
  },
  chartWrapper: {
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 20,
  },
  pieContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  topCategoriesContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  categoriesListContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  noDataText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  insightsContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  insightText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 15,
    flex: 1,
  },
  insightHighlight: {
    fontWeight: '700',
  },
});

export default AnalyticsScreen;