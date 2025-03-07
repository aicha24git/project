import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Marker } from 'react-native-maps';
import useLocation from '../hooks/useLocation'; 
import PeriodSelector from '../components/PeriodSelector';

export default function HomeScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState('Tout');

  // Utilisation du hook useLocation pour récupérer la localisation
  const { location, error } = useLocation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadNotes();
    });

    return unsubscribe;
  }, [navigation]);

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem("notes");
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (error) {
      console.error("Erreur chargement notes:", error);
    }
  };

  const filterByPeriod = (notes, period) => {
    const today = new Date();
    switch (period) {
      case 'Jour':
        return notes.filter(note => {
          const noteDate = new Date(note.date);
          return noteDate.toDateString() === today.toDateString();
        });
      case 'Semaine':
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        return notes.filter(note => {
          const noteDate = new Date(note.date);
          return noteDate >= startOfWeek && noteDate <= endOfWeek;
        });
      case 'Mois':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return notes.filter(note => {
          const noteDate = new Date(note.date);
          return noteDate >= startOfMonth && noteDate <= endOfMonth;
        });
      default:
        return notes; // 'Tout'
    }
  };

  const filteredNotes = filterByPeriod(
    notes.filter((note) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "completed" && note.completed) ||
        (filter === "pending" && !note.completed) ||
        (filter === "notes" && note.category === "note") ||
        (filter === "tasks" && note.category === "tâche");

      const matchesSearch =
        note.title.toLowerCase().includes(searchText.toLowerCase()) ||
        note.description.toLowerCase().includes(searchText.toLowerCase());

      return matchesFilter && matchesSearch;
    }),
    selectedPeriod
  );

  const FilterButton = ({ title, value }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.filterButtonTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.noteItem}
      onPress={() => navigation.navigate("NoteDetail", { note: item })}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.categoryIcon}>
          {item.category === "note" ? "📝" : "✓"}
        </Text>
        <View style={styles.noteContent}>
          <Text
            style={[styles.noteTitle, item.completed && styles.completedText]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.noteDescription,
              item.completed && styles.completedText,
            ]}
          >
            {item.description}
          </Text>
        </View>
        <View style={styles.noteMetadata}>
          <Text style={styles.noteDate}>{item.date}</Text>
          {item.location && <Text style={styles.noteIcon}>📍</Text>}
          {item.photo && <Text style={styles.noteIcon}>📷</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        <FilterButton title="Tout" value="all" />
        <FilterButton title="Notes" value="notes" />
        <FilterButton title="Tâches" value="tasks" />
        <FilterButton title="Terminé" value="completed" />
        <FilterButton title="En cours" value="pending" />
      </ScrollView>

      <PeriodSelector
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddNote")}
      >
        <Text style={styles.addButtonText}>+ Nouvelle Note</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredNotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />

      {/* Ajout de la carte ici */}
      {location && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Votre position"
            />
          </MapView>
        </View>
      )}

      {/* Affichage des erreurs de localisation */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  searchInput: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 10,
    height: 10,
  },
  filterButton: {
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#4CAF50",
  },
  filterButtonText: {
    color: "black",
  },
  filterButtonTextActive: {
    color: "white",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  list: {
    flex: 1,
  },
  noteItem: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  noteDescription: {
    fontSize: 14,
    color: "#666",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  noteMetadata: {
    alignItems: "flex-end",
  },
  noteDate: {
    fontSize: 12,
    color: "#666",
  },
  noteIcon: {
    fontSize: 12,
    marginTop: 4,
  },
  // Styles pour la carte
  mapContainer: {
    height: 200, // Ajustez la hauteur selon vos besoins
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});