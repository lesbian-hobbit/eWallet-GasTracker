import React, { useEffect, 
                useState } from 'react';
import { View, 
         Text, 
         FlatList, 
         StyleSheet, 
         StatusBar, 
         TextInput } from 'react-native';
import CoinItem from '../components/CoinItem';

const Currency = () => {

  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=php&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en'
    );
    const data = await res.json();
    console.log('loaded to updated currency');
    setCoins(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#141414" />
      <View style={styles.header}>
        <Text style={styles.title}>CryptoCurrency</Text>
        <TextInput
          style={styles.search}
          placeholder="Search a Coin"
          placeholderTextColor="#858585"
          onChangeText={text => setSearch(text)}
        />
      </View>
      <FlatList
        style={styles.list}
        data={coins.filter(
          coin =>
            coin.name.toLowerCase().includes(search.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(search.toLowerCase())
        )}
        renderItem={({ item }) => {
          return <CoinItem coin={item} />;
        }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await loadData();
          setRefreshing(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 10,
  },
  title: {
    color: 'white',
    marginTop: 10,
    fontSize: 20,
  },
  list: {
    width: '90%',
  },
  search: {
    color: 'white',
    borderBottomColor: '#4657CE',
    borderBottomWidth: 1,
    width: '40%',
    textAlign: 'center',
  },
});

export default Currency;
