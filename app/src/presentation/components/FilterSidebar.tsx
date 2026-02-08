import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../../context/theme.context";
import { Facet, FacetValue } from "../../domain/entities/facet";

interface FilterSidebarProps {
  visible: boolean;
  onClose: () => void;
  facets: Facet[];
  selectedFacets: { key: string; value: string }[];
  onToggleFacet: (facet: FacetValue) => void;
  totalCount: number;
  onClearAll: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  visible,
  onClose,
  facets,
  selectedFacets,
  onToggleFacet,
  totalCount,
  onClearAll,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [expandedFacets, setExpandedFacets] = useState<Record<string, boolean>>(
    {}
  );

  const toggleExpand = (name: string) => {
    setExpandedFacets((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isSelected = (value: FacetValue) => {
    return selectedFacets.some(
      (f) => f.key === value.key && f.value === value.value
    );
  };

  const renderFacetValue = ({ item }: { item: FacetValue }) => (
    <TouchableOpacity
      style={styles.facetValue}
      onPress={() => onToggleFacet(item)}
    >
      <View
        style={[
          styles.checkbox,
          { borderColor: isDark ? "#555" : "#DDD" },
          isSelected(item) && {
            backgroundColor: isDark ? "#FFF" : "#000",
            borderColor: isDark ? "#FFF" : "#000",
          },
        ]}
      >
        {isSelected(item) && (
          <Ionicons name="checkmark" size={14} color={isDark ? "#000" : "#FFF"} />
        )}
      </View>
      <Text style={[styles.facetValueLabel, { color: isDark ? "#FFF" : "#000" }]}>
        {item.name}
      </Text>
      <Text style={styles.facetValueCount}>({item.quantity})</Text>
    </TouchableOpacity>
  );

  const renderFacet = ({ item: facet }: { item: Facet }) => {
    const isExpanded = expandedFacets[facet.name];
    if (!facet.values || facet.values.length === 0) return null;

    return (
      <View style={styles.facetContainer}>
        <TouchableOpacity
          style={styles.facetHeader}
          onPress={() => toggleExpand(facet.name)}
        >
          <Text style={[styles.facetTitle, { color: isDark ? "#FFF" : "#000" }]}>
            {facet.name}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={isDark ? "#AAA" : "#666"}
          />
        </TouchableOpacity>

        {isExpanded && (
          <FlatList
            data={facet.values}
            renderItem={renderFacetValue}
            keyExtractor={(item) => `${item.key}-${item.value}`}
            scrollEnabled={false}
          />
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: isDark ? "#000" : "#FFF" }]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={isDark ? "#FFF" : "#000"} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? "#FFF" : "#000" }]}>
            FILTROS
          </Text>
          <TouchableOpacity onPress={onClearAll}>
            <Text style={styles.clearAll}>LIMPIAR</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={facets}
          renderItem={renderFacet}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.listContent}
        />

        <View
          style={[
            styles.footer,
            { borderTopColor: isDark ? "#222" : "#EEE" },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.applyButton,
              { backgroundColor: isDark ? "#FFF" : "#000" },
            ]}
            onPress={onClose}
          >
            <Text
              style={[
                styles.applyButtonText,
                { color: isDark ? "#000" : "#FFF" },
              ]}
            >
              VER {totalCount} RESULTADOS
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2,
  },
  closeButton: {
    padding: 4,
  },
  clearAll: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
    textDecorationLine: "underline",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  facetContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#222",
  },
  facetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  facetTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  facetValue: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 2,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  facetValueLabel: {
    fontSize: 14,
    flex: 1,
  },
  facetValueCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  applyButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
});

export default FilterSidebar;
