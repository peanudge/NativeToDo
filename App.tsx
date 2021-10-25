import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { theme } from "./color";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Fontisto } from "@expo/vector-icons";
interface ToDo {
  text: string;
  work: boolean;
}

type ToDos = { [key: string]: ToDo };

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState<ToDos>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const travel = () => setWorking(false);
  const work = () => setWorking(true);

  const loadToDos = async () => {
    try {
      setLoading(true);
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if (s) {
        setToDos(JSON.parse(s) as ToDos);
      }
    } catch (err) {
      setErrorMessage("저장된 ToDo 리스트를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeText = async (str: string) => await setText(str);

  const saveToDos = async (toSave: ToDos) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const addToDo = () => {
    if (text === "") {
      return;
    }
    const newToDos: ToDos = { ...toDos, [Date.now()]: { text, work: working } };
    setToDos(newToDos);
    saveToDos(newToDos);
    setText("");
  };

  useEffect(() => {
    loadToDos();
  }, []);

  const deleteToDo = async (id: string) => {
    Alert.alert("Delete To Do", "Are you sure", [
      { text: "Cancel" },
      {
        text: "I`m Sure",
        style: "destructive",
        onPress: () => {
          const newTodos = { ...toDos };
          delete newTodos[id];
          setToDos(newTodos);
          saveToDos(newTodos);
        },
      },
    ]);
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.gray }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.gray,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addToDo}
          returnKeyType="done"
          autoCapitalize="sentences"
          value={text}
          onChangeText={handleChangeText}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={styles.input}
        />
      </View>
      {loading ? (
        <View style={{ justifyContent: "center", alignContent: "center" }}>
          <ActivityIndicator size={50} />
        </View>
      ) : (
        <ScrollView>
          {Object.keys(toDos).map((timestamp) => {
            if (toDos[timestamp].work === working) {
              return (
                <View key={timestamp} style={styles.toDoCard}>
                  <Text style={styles.toDoText}>{toDos[timestamp].text}</Text>
                  <TouchableOpacity onPress={() => deleteToDo(timestamp)}>
                    <Fontisto name="trash" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              );
            }
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color: "white",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 20,
    fontSize: 18,
  },
  toDoCard: {
    marginBottom: 10,
    backgroundColor: theme.toDoBg,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toDoText: {
    fontSize: 16,
    color: "#fff",
  },
});
