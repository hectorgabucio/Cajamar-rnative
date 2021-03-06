import React from "react";
import { StyleSheet, Image, View } from "react-native";



import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


import { theme } from "../ThemeVariables";
import {
  Card,
  Text,
  Title,
  Paragraph,
  Surface,
  Headline,
  withTheme
} from "react-native-paper";
import { format } from "date-fns";
import { ScrollView } from "react-native-gesture-handler";
import ResultadoBalance from "./ResultadoBalance";
import { GLOBAL, realOrDemo, DemoState } from "../Global";

interface BalanceProps {
  balance: IBalance;
}

export interface IBalance {
  from: Date;
  to: Date;
  total: number;
  positive: number;
  negative: number;
}

const styles = StyleSheet.create({
  cardRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 8
  }
});



class Balance extends React.PureComponent<BalanceProps, DemoState> {
  constructor(props) {
    super(props);

    this.state = { demo: false };
  }

  render() {
    GLOBAL.BalanceState = this;
    const { colors, roundness } = this.props.theme;
    let totalColor = this.props.balance.total > 0 ? "green" : "red";

    let porcentajeAhorro = (
      (this.props.balance.total * 100) /
      this.props.balance.positive
    ).toFixed(2);

    return (
      <View
        contentContainerStyle={{
          paddingVertical: 10,
          paddingHorizontal: 10
        }}
        style={{
          flex: 1,
          flexDirection: "column"
        }}
      >
        <Surface
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: colors.primary,
            borderRadius: roundness,
            elevation: 5,
            margin: 5
          }}
        >
          <View
            style={{
              flex: 1,
              borderTopLeftRadius: roundness,
              borderTopRightRadius: roundness,
              flexDirection: "row",
              justifyContent: "center",
              backgroundColor: colors.primary
            }}
          >
            <Headline style={{ color: "white" }}>Balance total</Headline>
          </View>

          <View
            style={{
              backgroundColor: "white",
              borderRadius: roundness,
              padding: 10
            }}
          >
            <View
              style={[
                styles.cardRow,
                {
                  borderRadius: roundness
                }
              ]}
            >
              <Icon size={24} name="calendar" />
              <Text>
                {"" +
                  format(this.props.balance.from, "DD/MM/YYYY") +
                  " a " +
                  format(this.props.balance.to, "DD/MM/YYYY")}
              </Text>
            </View>

            <View style={[styles.cardRow]}>
              <Icon size={24} name="thumb-up" />
              <Text>
                {"Ingresado: " +
                  realOrDemo(this.props.balance.positive.toString()) +
                  "€"}
              </Text>
            </View>

            <View style={[styles.cardRow]}>
              <Icon size={24} name="thumb-down" />
              <Text>
                {"Gastado: " +
                  realOrDemo(this.props.balance.negative.toString()) +
                  "€"}
              </Text>
            </View>

            <View style={[styles.cardRow]}>
              <Icon size={24} name="scale-balance" />
              <Text style={{ color: totalColor }}>
                {"Total: " +
                  realOrDemo(this.props.balance.total.toString()) +
                  "€"}
              </Text>
            </View>
          </View>
        </Surface>

        <ResultadoBalance ahorro={porcentajeAhorro} />
      </View>
    );
  }
}

export default withTheme(Balance);
