import { Formik } from "formik";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity
} from "react-native";
import * as yup from "yup";

// dummy distances
const distances = [
  { id: "FIVE_K", abbr: "5K", defaultTime: 22.5, high: 45, low: 15 },
  { id: "TEN_K", abbr: "10K", defaultTime: 45, high: 90, low: 30 },
  { id: "HALF_MARATHON", abbr: "HM", defaultTime: 90, high: 180, low: 65 }
];

// has target time options
const hasTargetTime = [
  { id: true, abbr: "Yes" },
  { id: false, abbr: "No" }
];

export default function App() {
  // set up local state to update validations
  const [distance, setDistance] = useState(distances[0].id);

  // on renders save active distance and its props
  const { low, high } = distances.filter(({ id }) => id === distance)[0];

  // validations
  const validiationSchema = yup.object().shape({
    distance: yup.string().matches(/(FIVE_K|TEN_K|HALF_MARATHON)/),
    time: yup.mixed().when("hasTime", {
      is: true,
      then: yup.number().min(low).max(high),
      otherwise: yup.mixed().nullable()
    })
  });

  // distance picker event handler
  const handleDistanceChange = async (formik, value) => {
    // set state to whatever user selected
    setDistance(value);

    const selectedDistance = distances.filter(({ id }) => id === value)[0];
    const defaultTime = selectedDistance.defaultTime;
    let time = null;
    if (formik.values.hasTime) {
      time = defaultTime;
    }

    await formik.setFieldValue("distance", value);
    await formik.setFieldValue("time", time);
  };

  // has target time event handler
  const handleHasTimeChange = async (formik, value) => {
    let time = null;
    // time
    if (value) {
      const { defaultTime } = distances.filter(
        ({ id }) => id === formik.values.distance
      )[0];
      time = defaultTime;
    }

    // time
    await formik.setFieldValue("hasTime", value);
    await formik.setFieldValue("time", time);
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ distance: "FIVE_K", hasTime: false, time: null }}
        validationSchema={validiationSchema}
        onSubmit={(values, actions) => console.log(values)}
      >
        {formik => (
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row" }}>
              {distances.map(({ id, abbr }) => {
                const active = id === formik.values.distance;
                return (
                  <Selector
                    {...{
                      active,
                      abbr,
                      onPress: () => handleDistanceChange(formik, id)
                    }}
                  />
                );
              })}
            </View>
            <View style={{ flexDirection: "row" }}>
              {hasTargetTime.map(({ id, abbr }) => {
                const active = formik.values.hasTime === id;
                return (
                  <Selector
                    {...{
                      active,
                      abbr,
                      onPress: () => handleHasTimeChange(formik, id)
                    }}
                  />
                );
              })}
            </View>
            {formik.values.hasTime && (
              <View>
                <TextInput
                  value={JSON.stringify(formik.values.time)}
                  onChangeText={val =>
                    formik.setFieldValue("time", parseFloat(val))
                  }
                />
              </View>
            )}
            <Text style={{ color: formik.errors.time ? "red" : "black" }}>
              Errors: {JSON.stringify(formik.errors, null, 2)}
            </Text>
            <Submit {...{ onSubmit: () => formik.handleSubmit() }} />
          </View>
        )}
      </Formik>
    </View>
  );
}

const Submit = ({ onSubmit }) => {
  return (
    <TouchableOpacity onPress={onSubmit}>
      <View>
        <Text>Submit</Text>
      </View>
    </TouchableOpacity>
  );
};

// Component for selecting from choices
const Selector = ({ active, abbr, onPress }) => {
  return (
    <TouchableOpacity {...{ onPress }} style={{ flex: 1 }}>
      <View style={{ backgroundColor: active ? "#2875FB" : "white" }}>
        <Text
          style={{ textAlign: "center", color: active ? "white" : "black" }}
        >
          {abbr}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 80,
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center"
  }
});
