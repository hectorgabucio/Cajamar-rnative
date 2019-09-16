import React from "react";
import { Modal, Alert, View, TouchableHighlight, Text } from "react-native";
import Dates from "react-native-dates";
import { isBefore } from "date-fns";
import { withTheme } from "react-native-paper";
import moment from "moment";

interface DateRangePickerProps {
  from: Date;
  to: Date;
  visible: boolean;
  onRangePicked: (from: Date, to: Date) => void;
}

interface DateRangePickerState {
  startDate: Date;
  endDate: Date;
  focus: string;
}

class DateRangePicker extends React.PureComponent<
  DateRangePickerProps,
  DateRangePickerState
> {
  constructor(props) {
    super(props);

    this.state = {
      focus: "startDate",
      startDate: this.props.from,
      endDate: this.props.to
    };
  }

  //isDateBlocked = (date: string | number | Date) => isBefore(new Date(), date);

  render() {
    const isDateBlocked = date => date.isBefore(moment(), "day");

    const onDatesChange = ({ startDate, endDate, focusedInput }) => {
      if (moment.isMoment(startDate) || moment.isMoment(endDate)) {
        let dateStart = moment.isMoment(startDate)
          ? startDate.toDate()
          : this.state.startDate;
        let dateEnd = moment.isMoment(endDate)
          ? endDate.toDate()
          : this.state.endDate;

        console.log("ondateschange", dateStart, dateEnd, focusedInput);
        this.setState({ ...this.state, focus: focusedInput }, () =>
          this.setState({
            startDate: dateStart,
            endDate: dateEnd
          })
        );
      }
    };

    return (
      <Modal
        animationType="fade"
        transparent={false}
        visible={this.props.visible}
        onRequestClose={() => {
          this.props.onRangePicked(this.state.startDate, this.state.endDate);
        }}
      >
        <View style={{ flex: 1 }}>
          <View>
            <Dates
              onDatesChange={onDatesChange}
              isDateBlocked={isDateBlocked}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              focusedInput={this.state.focus}
              focusedMonth={moment("05/09/2030", "DD/MM/YYYY")}
              range
            />

            <TouchableHighlight
              onPress={() => {
                this.props.onRangePicked(
                  this.state.startDate,
                  this.state.endDate
                );
              }}
            >
              <Text>Hide Modal</Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    );
  }
}

export default withTheme(DateRangePicker);