import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useTheme } from "../../context/theme.context";

const SORT_OPTIONS = [
  { label: "PRECIO: MENOR A MAYOR", value: "OrderByPriceASC" },
  { label: "PRECIO: MAYOR A MENOR", value: "OrderByPriceDESC" },
  { label: "MÁS RECIENTES", value: "OrderByReleaseDateDESC" },
  { label: "MEJOR DESCUENTO", value: "OrderByBestDiscountDESC" },
  { label: "MÁS VENDIDOS", value: "OrderByTopSaleDESC" },
];

interface SortSelectorProps {
  visible: boolean;
  onClose: () => void;
  currentValue: string;
  onSelect: (value: string) => void;
}

const SortSelector: React.FC<SortSelectorProps> = ({
  visible,
  onClose,
  currentValue,
  onSelect,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.content,
                { backgroundColor: isDark ? "#111" : "#FFF" },
              ]}
            >
              <View style={styles.header}>
                <Text style={[styles.title, { color: isDark ? "#FFF" : "#000" }]}>
                  ORDENAR POR
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDark ? "#FFF" : "#000"}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.option}
                    onPress={() => handleSelect(option.value)}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: isDark ? "#FFF" : "#000",
                          fontWeight:
                            currentValue === option.value ? "700" : "400",
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {currentValue === option.value && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={isDark ? "#FFF" : "#000"}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "50%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  optionLabel: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
});

export default SortSelector;
