import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  Platform,
} from 'react-native';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks:', e);
    }
  };

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (e) {
      console.error('Failed to load tasks:', e);
    }
  };

  const addTask = () => {
    if (task.trim() === '') return;

    if (editingTaskId) {
      setTasks(tasks.map((t) =>
        t.id === editingTaskId ? { ...t, text: task, dueDate } : t
      ));
      setEditingTaskId(null);
    } else {
      setTasks([...tasks, { id: Date.now().toString(), text: task, completed: false, dueDate }]);
    }

    setTask('');
    setDueDate(null);
    Keyboard.dismiss();
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleComplete = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const editTask = (id) => {
    const taskToEdit = tasks.find((task) => task.id === id);
    if (taskToEdit) {
      setTask(taskToEdit.text);
      setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null);
      setEditingTaskId(id);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'All') return true;
    if (filter === 'Done') return task.completed;
    if (filter === 'Todo') return !task.completed;
  });

  const onDateChange = (event, selectedDate) => {
    if (event.type === "set" && selectedDate) {
      setDueDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List 📝</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your task"
          value={task}
          onChangeText={setTask}
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
        />

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>📅</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>
            {editingTaskId ? 'Save' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display={Platform.OS === 'android' ? 'calendar' : 'inline'}
          onChange={onDateChange}
        />
      )}
      {dueDate && (
        <View style={styles.centeredDateContainer}>
          <Text style={styles.dueDateTextCentered}> 📅 {formatDate(dueDate)}</Text>
        </View>
      )}

      <View style={styles.filterContainer}>
        {['All', 'Done', 'Todo'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterButton, filter === type && styles.selectedFilter]}
            onPress={() => setFilter(type)}
          >
            <Text style={styles.filterText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Wala ka na ubrahon, so sad. 😭 </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.taskItemContainer}>
            <TouchableOpacity
              onPress={() => toggleComplete(item.id)}
              style={styles.taskItem}
            >
              <View>
                <Text
                  style={[styles.taskText, item.completed && styles.completedText]}
                >
                  {item.completed ? '✅ ' : '⬜ '} {item.text}
                </Text>
                {item.dueDate && (
                  <Text style={styles.dueDateText}>
                    📅 {formatDate(item.dueDate)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                onPress={() => editTask(item.id)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => deleteTask(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#f2f2f2'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  dateButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: 5,
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderRadius: 5,
  },
  addButtonText: { color: '#fff', fontSize: 16 },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#ddd',
  },
  selectedFilter: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    color: '#fff',
    fontSize: 16,
  },
  taskItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  taskItem: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  taskText: { fontSize: 16 },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 16,
    paddingHorizontal: 25,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  editButtonText: { color: '#fff', fontSize: 14 },
  deleteButtonText: { color: '#fff', fontSize: 14 },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
    fontStyle: 'italic',
  },
  dueDateTextCentered: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  centeredDateContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  dueDateText: {
    color: '#555',
    marginTop: 5,
    fontSize: 13,
    fontStyle: 'Arial',
  },
});