import React from "react";
import { IMovement } from "../components/Movement";
import { IBalance } from "../components/Balance";
import { subDays, isBefore } from "date-fns";
import { View } from "react-native";
import { ActivityIndicator, Text, Title } from "react-native-paper";
import { StackActions, NavigationActions } from "react-navigation";
import { encryptStringWithRsaPublicKey } from "../Security";

function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function getImportantMovements(coll: IMovement[]) {
  let masBeneficiosos = coll
    .filter(mov => mov.amount > 0)
    .sort((a, b) => a.amount - b.amount);

  if (masBeneficiosos.length > 1) {
    masBeneficiosos = masBeneficiosos.slice(0, 1);
  }

  let masMalos = coll
    .filter(mov => mov.amount < 0)
    .sort((a, b) => a.amount - b.amount);

  if (masMalos.length > 1) {
    masMalos = masMalos.slice(0, 1);
  }

  console.log("masbeneficiosos");
  console.log(masBeneficiosos);

  console.log("masmalos");
  console.log(masMalos);

  //TODO segun la estrategia
  if (masMalos.length > 0) {
    return masMalos[0];
  }
}

function calculateBalance(coll: IMovement[], from: Date, to: Date): IBalance {
  let positivo = 0.0;
  let negativo = 0.0;

  for (let mov of coll) {
    let value = mov.amount;
    if (value >= 0) {
      positivo += value;
      positivo = +positivo.toFixed(2);
    } else {
      negativo += value;
      negativo = +negativo.toFixed(2);
    }
  }

  return {
    positive: positivo,
    negative: negativo,
    total: +(positivo + negativo).toFixed(2),
    from: from,
    to: to
  };
}

interface IState {
  isLoading: boolean;
  dataReceived: boolean;
  loadingInfo: string;
  movements: IMovement[];
  balance: IBalance;
}

export default class LoadingScreen extends React.PureComponent<{}, IState> {
  static navigationOptions = {
    header: null
  };
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      dataReceived: false,
      loadingInfo: "Cargando",
      movements: [],
      balance: undefined
    };
  }

  async componentDidMount() {
    try {
      var ws = new WebSocket("ws://cajamar-scrapper.herokuapp.com");
      //var ws = new WebSocket("ws://192.168.1.38:3000");

      ws.onopen = async () => {
        // connection opened
        //ws.send("something"); // send a message

        //https://stackoverflow.com/questions/46642143/rsa-encrypt-decrypt-in-typescript
        //let algo = Config.PUBLIC_KEY;
        console.log(Expo.Constants.manifest.extra.publicKey);

        let msg = "Comprobando RSA";

        let enc = encryptStringWithRsaPublicKey(
          msg,
          Expo.Constants.manifest.extra.publicKey
        );

        console.log("enc", enc);
        ws.send(enc);
      };

      ws.onmessage = e => {
        if (IsJsonString(e.data)) {
          console.log("AHORA EMPIEZO A PARSEAR");
          let json = JSON.parse(e.data);
          let today = new Date();
          let since = subDays(today, 31);

          console.log(since);

          let filtered: IMovement[] = [];

          for (let mov of json) {
            let parts = mov.date.split("/");
            let fechamov = new Date(
              parseInt(parts[2]),
              parseInt(parts[1]) - 1,
              parseInt(parts[0]) + 1
            );

            fechamov.setHours(0);
            fechamov.setMinutes(0);
            fechamov.setSeconds(0);
            fechamov.setMilliseconds(0);

            if (isBefore(since, fechamov)) {
              let movement: IMovement = {
                id: mov.id,
                date: fechamov,
                concept: mov.concept,
                amount: mov.amount
              };
              filtered.push(movement);
            }
          }

          let mostImportant = getImportantMovements(filtered);

          if (mostImportant) {
            let index = filtered.indexOf(mostImportant);
            if (index < filtered.length - 1 && index !== -1) {
              filtered = filtered.slice(0, index + 1);
            }

            const balance = calculateBalance(
              filtered,
              mostImportant.date,
              today
            );

            this.setState(
              {
                isLoading: false,
                dataReceived: true,
                movements: filtered,
                balance: balance
              },
              () => {
                const resetAction = StackActions.reset({
                  index: 0,
                  actions: [
                    NavigationActions.navigate({
                      routeName: "Loaded",
                      params: {
                        balance: balance,
                        movements: filtered
                      }
                    })
                  ]
                });
                this.props.navigation.dispatch(resetAction);

                /*
                this.props.navigation.navigate("Loaded", {
                  balance: balance,
                  movements: filtered
                });
*/
              }
            );
          }
        } else {
          this.setState({ loadingInfo: e.data });
        }
      };

      ws.onerror = e => {
        // an error occurred
        console.log("error websocket");
        //console.log(e);

        if (!this.state.dataReceived) {
          const resetAction = StackActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({
                routeName: "Error"
              })
            ]
          });
          this.props.navigation.dispatch(resetAction);
        }
      };

      ws.onclose = e => {
        // connection closed
        //console.log(e.code, e.reason);
      };
    } catch (err) {
      console.log("ERROR");
      console.log(err);
    } finally {
      ws.close();
    }
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator animating={true} size={64} />
        <Title>{this.state.loadingInfo}</Title>
      </View>
    );
  }
}
