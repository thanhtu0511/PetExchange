import { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Colors from '../../constants/Colors';

export default function SearchFilterBar({ onSearchChange, onPriceChange, onSortChange, defaultSort = 'asc' }) {
  const [searchText, setSearchText] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortPrice, setSortPrice] = useState(defaultSort);

  // Khi search text thay đổi
  useEffect(() => {
    onSearchChange(searchText);
  }, [searchText]);

  // Khi giá min/max thay đổi
  useEffect(() => {
    onPriceChange(minPrice, maxPrice);
  }, [minPrice, maxPrice]);

  // Khi sort thay đổi
  useEffect(() => {
    onSortChange(sortPrice);
  }, [sortPrice]);

  // Xóa toàn bộ input
  const clearAll = () => {
    setSearchText('');
    setMinPrice('');
    setMaxPrice('');
    setSortPrice(defaultSort);
  };

  return (
      <View style={styles.container}>
        {/* Search input + clear */}
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Search by name or breed"
            value={searchText}
            onChangeText={setSearchText}
            style={[styles.searchInput, { flex: 1 }]}
          />
          <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Price filter */}
        <View style={styles.priceContainer}>
          <TextInput
            placeholder="Min"
            value={minPrice}
            onChangeText={setMinPrice}
            keyboardType="numeric"
            style={styles.priceInput}
          />
          <TextInput
            placeholder="Max"
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
            style={styles.priceInput}
          />
        </View>

        {/* Sort Button */}
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setSortPrice(sortPrice === 'asc' ? 'desc' : 'asc')}
        >
          <Text style={styles.sortText}>
            {sortPrice === 'asc' ? 'Price: Low → High' : 'Price: High → Low'}
          </Text>
        </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    gap: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 10,
    height: 45,
    paddingHorizontal: 12,
    fontFamily: 'outfit-regular',
  },
  clearBtn: {
    backgroundColor: Colors.LIGHT_PRIMARY,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    justifyContent: 'center',
  },
  clearText: {
    color: Colors.PRIMARY,
    fontFamily: 'outfit-medium',
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 10,
    fontFamily: 'outfit-regular',
  },
  sortBtn: {
    backgroundColor: Colors.LIGHT_PRIMARY,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  sortText: {
    color: Colors.PRIMARY,
    fontFamily: 'outfit-medium',
    fontSize: 12,
  },
});
