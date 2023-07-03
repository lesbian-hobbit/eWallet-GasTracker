import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/core';
import { auth, firebase } from '../firebase';
import { onSnapshot, orderBy } from 'firebase/firestore';

const Logs = () => {
  const [logInfo, setLogs] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const onPress = () => {
    navigation.navigate('ReceiveLogs');
  };

  const openModal = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
    setModalVisible(false);
  };

  useEffect(() => {
    const user = auth.currentUser.uid;
    if (user) {
      const uid = user;
      const todoRef = firebase
        .firestore()
        .collection('users')
        .doc(uid)
        .collection('history')
        .doc('DUgVrFDJhas4wAuX07re')
        .collection('Sent')
        .orderBy('Timestamp', 'desc'); // Order the documents by timestamp in descending order
      const unsubscribe = onSnapshot(todoRef, (querySnapshot) => {
        const logs = querySnapshot.docs.map((doc) => {
          const { ReceiverUid, Timestamp, transactions, Sender, ReceiverEmail } = doc.data();
          let formattedTimestamp = '';
          if (Timestamp && Timestamp.toDate) {
            formattedTimestamp = Timestamp.toDate().toLocaleString();
          }
          return {
            id: doc.id,
            ReceiverUid,
            Timestamp: formattedTimestamp,
            transactions,
            ReceiverEmail
          };
        });
        setLogs(logs);
        console.log(logs);
      });

      return () => unsubscribe();
    }
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/background1.jpg')} resizeMode="cover" style={styles.image}>
        <FlatList
          showsVerticalScrollIndicator={false}
          style={styles.flatlistContainer}
          data={logInfo}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.logItem, index === 0 && styles.highlightedLog]}
              onPress={() => openModal(item)}
            >
              <Text>You have just sent ₱{item.transactions} to {item.ReceiverEmail}</Text>
              <Text style={styles.timestampText}>{item.Timestamp}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
        <View style={styles.receivedButton}>
          <TouchableOpacity style={styles.ButtonContainer} onPress={onPress}>
            <Text style={styles.buttonText}>Received History</Text>
          </TouchableOpacity>
        </View>
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            {selectedTransaction && (
              <View style={styles.transactionModal}>
                <Text style={styles.modalText}>Transaction Details</Text>
                <Text>Transaction: ₱{selectedTransaction.transactions}</Text>
                <Text>Receiver: {selectedTransaction.ReceiverEmail}</Text>
                <Text>Timestamp: {selectedTransaction.Timestamp}</Text>
                                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

export default Logs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  ButtonContainer: {
    marginHorizontal: 80,
    backgroundColor: "#111827",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  receivedButton: {
    padding: 10,
    marginBottom: 10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatlistContainer: {
    padding: 20,
  },
  listContainer: {
    paddingBottom: 16,
  },
  logItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  highlightedLog: {
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  logText: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  timestampText: {
    fontSize: 12,
    color: '#888888',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  transactionModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#111827',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

