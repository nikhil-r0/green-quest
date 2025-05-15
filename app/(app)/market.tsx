import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';

const products = [
  { id: '1', name: 'Fresh Chiquita Banana', price: '03.00', proweight: '1 kg', image: require('@/assets/images/logo.png') },
  { id: '2', name: 'Organic Apple', price: '04.50', proweight: '1 kg', image: require('@/assets/images/logo.png') },
];

export default function MarketScreen() {
  const [cart, setCart] = useState({});

  const increment = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decrement = (id) => {
    setCart((prev) => {
      const newCount = (prev[id] || 0) - 1;
      if (newCount <= 0) {
        const updatedCart = { ...prev };
        delete updatedCart[id];
        return updatedCart;
      }
      return {
        ...prev,
        [id]: newCount,
      };
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Products</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productList}
        renderItem={({ item }) => {
          const quantity = cart[item.id] || 0;
          return (
            <View style={styles.productCard}>
              <Image source={item.image} style={styles.productImage} />
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productWeight}>{item.proweight}</Text>
              <Text style={styles.productPrice}>${item.price}</Text>

              {quantity === 0 ? (
                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => increment(item.id)}
                >
                  <Text style={styles.buyButtonText}>Buy</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.counterContainer}>
                  <TouchableOpacity onPress={() => decrement(item.id)} style={styles.counterButton}>
                    <Text style={styles.counterButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterText}>{quantity}</Text>
                  <TouchableOpacity onPress={() => increment(item.id)} style={styles.counterButton}>
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
    color: "#222",
  },
  productList: {
    paddingBottom: 60,
  },
  productRow: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  productCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 100,
    resizeMode: "contain",
    borderRadius: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 6,
    color: "#222",
  },
  productWeight: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007BFF",
    marginTop: 4,
  },
  buyButton: {
    backgroundColor: "#28a745",
    paddingVertical: 6,
    marginTop: 8,
    borderRadius: 6,
  },
  buyButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    backgroundColor: "#e0f7e9",
    padding: 6,
    borderRadius: 6,
  },
  counterButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  counterButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  counterText: {
    fontSize: 14,
    fontWeight: "bold",
    marginHorizontal: 8,
    color: "#333",
  },
});
