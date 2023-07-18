import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ImageBackground, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { auth, firebase } from '../firebase';
import { onSnapshot, orderBy, addDoc, collection } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { Color, FontFamily } from '../GlobalStyles';
import { registerForPushNotificationsAsync, presentNotificationAsync } from 'expo-notifications';

const NotificationsScreen = () => {
  const [logInfo, setLogs] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const [latestMessage, setLatestMessage] = useState(null);

  useEffect(() => {
    const handleNotificationPress = () => {
      // Redirect the user to the NotificationsScreen
      navigation.navigate('Notifications');
    };

    const registerNotificationHandler = async () => {
      // Get the notification permissions
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;

      // Ask for notification permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission not granted for notifications.');
        return;
      }

      // Add a listener to handle notification presses
      Notifications.addNotificationResponseReceivedListener(handleNotificationPress);
    };

    registerNotificationHandler();
  }, []);

  
  const onPress = () => {
    navigation.navigate('Main');
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
        .collection('notes')
        .doc('messages')
        .collection('receivedMessages')
        .orderBy('Timestamp', 'desc'); // Order the documents by timestamp in descending order
      const unsubscribe = onSnapshot(todoRef, (querySnapshot) => {
        const logs = querySnapshot.docs.map((doc) => {
          const { ReceiverUid, Timestamp, transactions, Sender, SenderEmail, Note } = doc.data();
          let formattedTimestamp = '';
          if (Timestamp && Timestamp.toDate) {
            formattedTimestamp = Timestamp.toDate().toLocaleString();
          }
          return {
            id: doc.id,
            ReceiverUid,
            Timestamp: formattedTimestamp,
            transactions,
            Sender,
            SenderEmail,
            Note
          };
        });
        setLogs(logs);
      });

      return () => unsubscribe();
    }
  }, []);

  // const sendNotification = async (transactions, senderEmail, note) => {
  //   const localNotification = {
  //     title: 'New Message',
  //     body: `You just received ₱${transactions} from ${senderEmail}${note ? ` with a note: ${note}` : ''}`,
  //     android: {
  //       sound: true,
  //     },
  //     ios: {
  //       sound: true,
  //     },
  //   };

  //   const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
  //   if (status === 'granted') {
  //     await presentNotificationAsync(localNotification);
  //   } else {
  //     console.log('Permission not granted for notifications.');
  //   }
  // };

  // const sendPushNotification = async (message) => {
  //   const user = auth.currentUser;
  //   if (user) {
  //     const uid = user.uid;
  //     const userRef = firebase.firestore().collection('users').doc(uid);
  //     const userDoc = await userRef.get();
  //     const expoPushToken = userDoc.data()?.expoPushToken;
  
  //     if (expoPushToken) {
  //       const response = await fetch('https://exp.host/--/api/v2/push/send', {
  //         method: 'POST',
  //         headers: {
  //           Accept: 'application/json',
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           ...message,
  //           to: expoPushToken,
  //         }),
  //       });
  
  //       const result = await response.json();
  //       console.log('Notification result:', result);
  //     } else {
  //       console.log('Expo Push Token not found in Firestore.');
  //     }
  //   }
  // };
  // useEffect(() => {
  //   const user = auth.currentUser.uid;
  //   if (user) {
  //     const uid = user;
  //     const todoRef = firebase
  //       .firestore()
  //       .collection('users')
  //       .doc(uid)
  //       .collection('notes')
  //       .doc('messages')
  //       .collection('receivedMessages')
  //       .orderBy('Timestamp', 'desc')
  //       .limit(1); // Retrieve only the most recent document
  //     const unsubscribe = onSnapshot(todoRef, (querySnapshot) => {
  //       if (!querySnapshot.empty) {
  //         const doc = querySnapshot.docs[0];
  //         const { ReceiverUid, Timestamp, transactions, Sender, SenderEmail, Note } = doc.data();
  //         let formattedTimestamp = '';
  //         if (Timestamp && Timestamp.toDate) {
  //           formattedTimestamp = Timestamp.toDate().toLocaleString();
  //         }
  //         const latestMessage = {
  //           id: doc.id,
  //           ReceiverUid,
  //           Timestamp: formattedTimestamp,
  //           transactions,
  //           Sender,
  //           SenderEmail,
  //           Note
  //         };
  //         setLatestMessage(latestMessage);
  //         sendNotification(latestMessage.transactions, latestMessage.SenderEmail, latestMessage.Note);
  //         sendPushNotification({ message: 'New message' });
  //       }
  //     });
  
  //     return () => unsubscribe();
  //   }
  // }, []);

  // useEffect(() => {
  //   const registerForPushNotifications = async () => {
  //     const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
  //     let finalStatus = existingStatus;
  //     if (existingStatus !== 'granted') {
  //       const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
  //       finalStatus = status;
  //     }
  //     if (finalStatus !== 'granted') {
  //       console.log('Permission not granted for notifications.');
  //       return;
  //     }
  //     const token = await registerForPushNotificationsAsync();
  //     console.log('Expo Push Token:', token.data);

  //     // Save the token to the user's document in Firestore
  //     const user = auth.currentUser;
  //     if (user) {
  //       const uid = user.uid;
  //       const userRef = firebase.firestore().collection('users').doc(uid);
  //       await userRef.update({
  //         expoPushToken: token.data,
  //       });
  //       console.log('Expo Push Token saved to Firestore.');
  //     }
  //   };

  //   registerForPushNotifications();

  //   const backgroundSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
  //     console.log('Notification Response:', response);
  //     // Handle the notification response when the app is in the background.
  //   });

  //   return () => {
  //     backgroundSubscription.remove();
  //   };
  // }, []);

  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        style={styles.flatlistContainer}
        data={logInfo}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.logItem, index === 0 && styles.highlightedLog]}
            onPress={() => openModal(item)}
          >
            <Text key={index}></Text>
            <Text style={styles.pesoText}>
              Received from {item.SenderEmail}
              {item.Note ? `\n Note:\n ${item.Note}` : ''}
            </Text>
            <Text style={styles.pesoMoney}>+₱{item.transactions}</Text>
            <Text style={styles.timestampText}>{item.Timestamp}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <View style={styles.receivedButton}>
        <TouchableOpacity style={styles.ButtonContainer} onPress={onPress}>
          <Text style={styles.buttonText}>Go Back Home</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          {selectedTransaction && (
            <View style={styles.transactionModal}>
              <Text style={styles.modalText}>Transaction Details</Text>
              <Text style={styles.modTrans}>Transaction: ₱{selectedTransaction.transactions}</Text>
              <Text style={styles.modTrans}>Sender: {selectedTransaction.SenderEmail}</Text>
              <Text style={styles.modTrans}>Time: {selectedTransaction.Timestamp}</Text>
              <Text style={styles.modTrans}>Note: {selectedTransaction.Note}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: Color.blackModePrimaryDark,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  ButtonContainer: {
    marginHorizontal: 80,
    backgroundColor: '#7B61FF',
    paddingVertical: 10,
    borderRadius: 15,
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: FontFamily.poppinsMedium,
    textAlign: 'center',
  },
  receivedButton: {
    padding: 10,
    marginBottom: 10,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  highlightedLog: {
    backgroundColor: '#7B61FF',
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
    color: 'white',
    alignSelf: 'flex-end',
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
    marginBottom: 10,
    fontFamily: FontFamily.poppinsBold,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#7B61FF',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: 'white',
    fontFamily: FontFamily.poppinsMedium,
  },
  pesoText: {
    color: 'white',
    fontFamily: FontFamily.poppinsMedium,
  },
  pesoMoney: {
    color: '#7CFC00',
    alignSelf: 'flex-end',
    fontSize: 20,
  },
  modTrans: {
    fontFamily: FontFamily.poppinsMedium,
    fontSize: 13,
  },
});