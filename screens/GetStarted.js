import { StyleSheet, View, Text, Pressable, SafeAreaView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import React from 'react'
import { useNavigation } from '@react-navigation/core';
import { Color, Border, FontFamily, FontSize, Padding } from "../GlobalStyles";

export default function GetStarted() {
    const navigation = useNavigation();
    const onPress = () => {
        navigation.navigate('Login');
      };
      return (
        <SafeAreaView style={styles.getStarted}>
    <View style={styles.logoContainer}>
      <Image
        style={styles.logo1Icon}
        source={require("../assets/logo-1.png")}
      />
    </View>
    
    <View style={[styles.headline, styles.headlineFlexBox]}>
      <Text style={styles.headlineTxt}>E-Wal Lato Digital Wallet</Text>
      <Text></Text>
    </View>

    <TouchableOpacity
      style={[styles.getstarted, styles.headlineFlexBox]}
      onPress={onPress}
    >
      <Text style={styles.copy}>Get Started</Text>
    </TouchableOpacity>
  </SafeAreaView>
      );
    };
    
    const styles = StyleSheet.create({
      headlineFlexBox: {
        justifyContent: 'center',
        alignItems: "center",
      },
      headlineTxt: {
        textAlign: "center",
        fontSize: 50,
        letterSpacing: 1,
        lineHeight: 60,
        fontWeight: "700",
        fontFamily: FontFamily.h4,
        color: Color.gray_700,
        marginTop: -180, // Adjust this value to bring the logo and text closer
      },
      headline: {
        flex: 1,
      },
      copy: {
        fontSize: FontSize.textXLSemiBold_size,
        lineHeight: 22,
        fontWeight: "600",
        fontFamily: FontFamily.mButton,
        color: Color.sUNRISEWhite,
        textAlign: "center",
      },
      copyClr: {
        color: Color.white,
        textAlign: "center",
      },
      getstarted: {
        borderRadius: Border.br_xs,
        backgroundColor: Color.sUNRISECoral,
        shadowColor: Color.gainsboro_200l,
        shadowOffset: {
        width: 0,
        height: 14,
        },
        shadowRadius: 23,
        elevation: 23,
        shadowOpacity: 1,
        width: 326,
        height: 56,
        flexDirection: "row",
        paddingHorizontal: Padding.p_13xl,
        paddingVertical: Padding.p_sm,
        justifyContent: "center",
        overflow: "hidden",
        marginBottom: 30,
      },
      logo1Icon: {
        width: 371,
        height: 257,
      },
      logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        paddingVertical: 10, // Adjust this value if needed
      },
      getStarted: {
        backgroundColor: Color.blackModePrimaryDark,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 12,
      },
    });
    