import DateTimePickerComponent, {
  AndroidNativeProps,
  DateTimePickerEvent,
  IOSNativeProps,
} from "@react-native-community/datetimepicker";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";

export default function DateTimePicker(
  props: IOSNativeProps | AndroidNativeProps
) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateTimePickerChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    props.onChange?.(event, selectedDate);
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  return (
    <View style={styles.container}>
      {(props.mode === "date" || props.mode === "datetime") && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>
            {props.value.toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </TouchableOpacity>
      )}
      {(props.mode === "time" || props.mode === "datetime") && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowTimePicker(true)}
        >
          <Text>
            {props.value.toLocaleString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </TouchableOpacity>
      )}
      {showDatePicker && (
        <DateTimePickerComponent
          testID={`${props.testID}-date`}
          value={props.value}
          mode='date'
          display={props.display}
          onChange={handleDateTimePickerChange}
          maximumDate={props.maximumDate}
        />
      )}
      {showTimePicker && (
        <DateTimePickerComponent
          testID={`${props.testID}-time`}
          value={props.value}
          mode='time'
          display={props.display}
          onChange={handleDateTimePickerChange}
          maximumDate={props.maximumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 15,
  },
  button: {
    backgroundColor: "lightgray",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
});
